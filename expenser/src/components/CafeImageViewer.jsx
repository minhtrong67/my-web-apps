import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../i18n';
import IconButton from './ui/IconButton';

/** Full-screen photo viewer: tap anywhere / press Esc / use the close button to dismiss. */
export default function CafeImageViewer({ src, title, onClose }) {
  const t = useT();
  useEffect(() => {
    if (!src) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-black/90" onClick={onClose}>
      <div className="flex items-center gap-2 p-3 text-white" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <p className="wrap-any min-w-0 flex-1 px-2 text-title-sm">{title}</p>
        <IconButton icon="close" label={t('common.close')} onClick={onClose} className="!text-white" />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <img src={src} alt={title || ''} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
      </div>
    </div>,
    document.body,
  );
}
