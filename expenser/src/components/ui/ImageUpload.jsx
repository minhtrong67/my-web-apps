import { useRef, useState } from 'react';
import { notify } from '../../utils/notify';
import { useT } from '../../i18n';
import { uploadImage, ImageUploadError } from '../../utils/imgbb';
import Icon from './Icon';
import Field from './Field';

/**
 * Picks an image, uploads it to imgbb right away and reports the resulting URL through
 * `onChange(url)`. `value` is the current URL ('' = none). Shows a preview with replace / remove.
 */
export default function ImageUpload({ label, value, onChange, hint, error, disabled }) {
  const t = useT();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      const code = err instanceof ImageUploadError ? err.code : 'failed';
      notify.error(t(`image.error.${code}`));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label={label} hint={hint} error={error}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={disabled || uploading} />
      {value || uploading ? (
        <div className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
          {value && <img src={value} alt="" className="h-44 w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />}
          {uploading && (
            <div className={`flex items-center justify-center gap-3 ${value ? 'absolute inset-0 bg-scrim/40 text-white' : 'h-44 text-on-surface-variant'}`}>
              <span className="m3-loader m3-loader-sm !bg-current" />
              <span className="text-label-lg">{t('image.uploading')}</span>
            </div>
          )}
          {!uploading && (
            <div className="absolute right-2 top-2 flex gap-2">
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
                onClick={() => onChange('')}
                disabled={disabled}
                aria-label={t('image.remove')}
                title={t('image.remove')}
                className="state-layer flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-error shadow-elev-1"
              >
                <Icon name="delete" size={18} />
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
    </Field>
  );
}
