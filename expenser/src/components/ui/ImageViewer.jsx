import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n';
import { usePresence } from '../../hooks/usePresence';
import IconButton from './IconButton';
import Icon from './Icon';

const ZOOM = 2.5; // how much bigger than "fit to screen" the zoomed picture is
const EXIT_MS = 220;
const stop = (e) => e.stopPropagation();

/**
 * Full-screen photo viewer. Tap the picture (or the zoom button) to zoom in / out, scroll or drag to
 * pan while zoomed; tap the dark area, press Esc or use the close button to dismiss.
 * Pass `src` = '' / null to close (it plays an exit animation first).
 */
export default function ImageViewer({ src, title, onClose }) {
  const { present, closing } = usePresence(!!src, EXIT_MS);
  // Remember the last photo so the exit animation still has something to show.
  const [shown, setShown] = useState({ src: src || '', title });
  if (src && (shown.src !== src || shown.title !== title)) setShown({ src, title });

  if (!present || !shown.src) return null;
  return createPortal(<ViewerBody key={shown.src} src={shown.src} title={shown.title} closing={closing} onClose={onClose} />, document.body);
}

function ViewerBody({ src, title, closing, onClose }) {
  const t = useT();
  const boxRef = useRef(null);
  const imgRef = useRef(null);
  const anchor = useRef({ fx: 0.5, fy: 0.5 });
  const closeRef = useRef(onClose);
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const [attempt, setAttempt] = useState(0);
  const [zoomW, setZoomW] = useState(0); // 0 = fit to screen, otherwise the picture's width in px
  const zoomed = zoomW > 0;

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Capture phase on window: Esc closes only the viewer, not the dialog that may sit underneath it.
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      closeRef.current?.();
    };
    window.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, []);

  // Cached photos can be complete before onLoad is attached.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, [attempt]);

  // Keep the point that was tapped under the finger when zooming in; reset the scroll when zooming out.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img) return;
    if (!zoomW) {
      box.scrollTo(0, 0);
      return;
    }
    box.scrollLeft = img.offsetLeft + anchor.current.fx * img.offsetWidth - box.clientWidth / 2;
    box.scrollTop = img.offsetTop + anchor.current.fy * img.offsetHeight - box.clientHeight / 2;
  }, [zoomW]);

  function toggleZoom(clientX, clientY) {
    const img = imgRef.current;
    const box = boxRef.current;
    if (!img || !box || status !== 'loaded') return;
    if (zoomed) {
      setZoomW(0);
      return;
    }
    const r = img.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const x = clientX ?? b.left + b.width / 2;
    const y = clientY ?? b.top + b.height / 2;
    anchor.current = r.width && r.height ? { fx: Math.min(1, Math.max(0, (x - r.left) / r.width)), fy: Math.min(1, Math.max(0, (y - r.top) / r.height)) } : { fx: 0.5, fy: 0.5 };
    setZoomW(Math.round(r.width * ZOOM));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || t('image.zoom')}
      className={`fixed inset-0 z-[60] flex flex-col bg-black/90 ${closing ? 'pointer-events-none animate-fade-out' : 'animate-fade-in'}`}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      // React events bubble through portals: keep taps / drags in the viewer from reaching e.g. a SwipeableItem it was opened from.
      onPointerDown={stop}
      onPointerMove={stop}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <div className="flex items-center gap-1 p-3 text-white" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }} onClick={(e) => e.stopPropagation()}>
        <p className="wrap-any min-w-0 flex-1 px-2 text-title-sm">{title}</p>
        <IconButton icon={zoomed ? 'zoom_out' : 'zoom_in'} label={zoomed ? t('image.zoomOut') : t('image.zoomIn')} onClick={() => toggleZoom()} disabled={status !== 'loaded'} className="!text-white" />
        <IconButton icon="close" label={t('common.close')} onClick={onClose} className="!text-white" />
      </div>

      <div ref={boxRef} className="relative flex min-h-0 flex-1 overflow-auto overscroll-contain p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {status === 'loading' && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="m3-loader !bg-white/90" />
          </span>
        )}
        {status === 'error' ? (
          <div className="m-auto flex flex-col items-center gap-3 text-center text-white" onClick={(e) => e.stopPropagation()}>
            <Icon name="broken_image" size={48} />
            <p className="text-body-lg">{t('image.loadError')}</p>
            <button
              type="button"
              onClick={() => {
                setStatus('loading');
                setAttempt((a) => a + 1);
              }}
              className="state-layer inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-5 text-label-lg text-white"
            >
              <Icon name="refresh" size={18} />
              {t('image.retry')}
            </button>
          </div>
        ) : (
          <img
            key={attempt}
            ref={imgRef}
            src={src}
            alt={title || ''}
            referrerPolicy="no-referrer"
            decoding="async"
            draggable={false}
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom(e.clientX, e.clientY);
            }}
            style={zoomed ? { width: zoomW, maxWidth: 'none', maxHeight: 'none', height: 'auto' } : undefined}
            className={`m-auto select-none transition-opacity duration-300 ${zoomed ? 'cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain'} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
    </div>
  );
}
