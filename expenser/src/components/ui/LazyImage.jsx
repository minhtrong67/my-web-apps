import { useEffect, useRef, useState } from 'react';
import { useT } from '../../i18n';
import Icon from './Icon';

/**
 * <img> with a proper loading story: a shimmering placeholder while the picture downloads, a soft
 * fade-in once it is ready and a "could not load" state (optionally with a retry button).
 * Give it a size through `className` (it fills its box); `imgClassName` controls object-fit etc.
 * Do not use `retryable` inside another <button> (nested buttons are invalid HTML).
 */
export default function LazyImage({ src, alt = '', className = '', imgClassName = 'object-cover', eager = false, retryable = false, iconSize = 28 }) {
  const t = useT();
  const imgRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const [attempt, setAttempt] = useState(0);

  // Images served from the browser cache can be complete before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    else setStatus('loading');
  }, [src, attempt]);

  return (
    <span className={`relative block overflow-hidden bg-surface-container ${className}`}>
      {status === 'loading' && (
        <span className="absolute inset-0" aria-hidden="true">
          <span className="skeleton block h-full w-full" />
        </span>
      )}
      {status === 'error' ? (
        <span role="img" aria-label={t('image.loadError')} className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-on-surface-variant">
          <Icon name="broken_image" size={iconSize} />
          {retryable && (
            <>
              <span className="text-label-md">{t('image.loadError')}</span>
              <button
                type="button"
                onClick={() => setAttempt((a) => a + 1)}
                className="state-layer relative z-20 inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary-container px-3 text-label-md text-on-secondary-container"
              >
                <Icon name="refresh" size={16} />
                {t('image.retry')}
              </button>
            </>
          )}
        </span>
      ) : (
        <img
          key={`${src}|${attempt}`}
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full transition-[opacity,transform] duration-500 ${imgClassName} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </span>
  );
}
