import { useEffect, useRef, useState } from 'react';
import { notify } from '../../utils/notify';
import { useT } from '../../i18n';
import { uploadImage, ImageUploadError, MAX_IMAGE_BYTES } from '../../utils/imgbb';
import Icon from './Icon';
import Field from './Field';
import LazyImage from './LazyImage';
import ImageViewer from './ImageViewer';

/**
 * Picks (or drops) an image, uploads it to imgbb right away and reports the resulting URL through
 * `onChange(url)`. `value` is the current URL ('' = none).
 *  - the picked photo is shown immediately from the device while it uploads, with a progress bar and a cancel button
 *  - tap the preview to open it full screen / zoomed
 *  - photos that are still downloading show a placeholder, failed ones a retry button
 *  - `onBusyChange(true|false)` lets the parent form wait for a running upload before saving
 */
export default function ImageUpload({ label, value, onChange, hint, error, disabled, onBusyChange }) {
  const t = useT();
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const blobRef = useRef('');
  const busyRef = useRef(onBusyChange);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // null = preparing the file, 0..1 = sending
  const [pending, setPending] = useState(''); // object URL of the file being uploaded
  const [local, setLocal] = useState(null); // { blob, url }: the file just uploaded, shown until the form is re-opened
  const [dragOver, setDragOver] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    busyRef.current = onBusyChange;
  }, [onBusyChange]);
  useEffect(() => {
    busyRef.current?.(uploading);
  }, [uploading]);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
      busyRef.current?.(false);
    },
    [],
  );

  const shown = pending || (local && local.url === value ? local.blob : value);

  function dropLocal() {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = '';
    setLocal(null);
  }

  async function startUpload(file) {
    if (!file || uploading || disabled) return;
    if (!file.type?.startsWith('image/')) return notify.error(t('image.error.notImage'));
    if (file.size > MAX_IMAGE_BYTES) return notify.error(t('image.error.tooLarge'));

    const blob = URL.createObjectURL(file);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPending(blob);
    setProgress(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, { onProgress: setProgress, signal: ctrl.signal });
      dropLocal();
      blobRef.current = blob;
      setLocal({ blob, url });
      onChange(url);
    } catch (err) {
      URL.revokeObjectURL(blob);
      if (!(err instanceof ImageUploadError && err.code === 'aborted')) {
        notify.error(t(`image.error.${err instanceof ImageUploadError ? err.code : 'failed'}`));
      }
    } finally {
      abortRef.current = null;
      setPending('');
      setUploading(false);
    }
  }

  function handleInput(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    startUpload(file);
  }

  const pct = progress == null ? null : Math.round(progress * 100);
  const frameDrop = {
    onDragOver: (e) => {
      if (disabled || uploading) return;
      e.preventDefault();
      setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      startUpload(e.dataTransfer?.files?.[0]);
    },
  };

  return (
    <Field label={label} hint={hint} error={error}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInput} disabled={disabled || uploading} />
      <div {...frameDrop} className={`rounded-2xl transition-shadow duration-200 ${dragOver ? 'ring-2 ring-primary' : ''}`}>
        {shown ? (
          <div className="relative h-44 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
            <LazyImage src={shown} className="h-full w-full" imgClassName="object-cover" eager retryable />
            {/* Transparent button on top = tap the photo to view it larger (retry / action buttons sit above it) */}
            {!uploading && <button type="button" onClick={() => setZoom(true)} aria-label={t('image.zoom')} className="absolute inset-0 z-10 cursor-zoom-in" />}
            {!uploading && (
              <>
                <span className="pointer-events-none absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-scrim/40 text-white" aria-hidden="true">
                  <Icon name="zoom_in" size={18} />
                </span>
                <div className="absolute right-2 top-2 z-20 flex gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    aria-label={t('image.replace')}
                    title={t('image.replace')}
                    className="state-layer flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-elev-1"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dropLocal();
                      onChange('');
                    }}
                    disabled={disabled}
                    aria-label={t('image.remove')}
                    title={t('image.remove')}
                    className="state-layer flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-error shadow-elev-1"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </>
            )}
            {uploading && (
              <div className="absolute inset-0 z-20 flex animate-fade-in flex-col items-center justify-center gap-3 bg-scrim/50 px-6 text-white" role="status" aria-live="polite">
                {pct == null ? (
                  <>
                    <span className="m3-loader m3-loader-sm !bg-current" />
                    <span className="text-label-lg">{t('image.processing')}</span>
                  </>
                ) : (
                  <>
                    <div className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-white/30" aria-hidden="true">
                      <div className="h-full rounded-full bg-white transition-[width] duration-200 ease-out" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-label-lg tabular-nums">{t('image.uploadingPct', { n: pct })}</span>
                  </>
                )}
                <button type="button" onClick={() => abortRef.current?.abort()} className="state-layer h-8 rounded-full px-4 text-label-md text-white">
                  {t('image.cancelUpload')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="state-layer flex h-28 w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-outline text-on-surface-variant"
          >
            <Icon name="add_photo_alternate" size={28} />
            <span className="text-label-lg">{t('image.add')}</span>
          </button>
        )}
      </div>
      <ImageViewer src={zoom ? shown : ''} title={label} onClose={() => setZoom(false)} />
    </Field>
  );
}
