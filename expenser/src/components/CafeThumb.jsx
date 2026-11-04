import { useState } from 'react';
import { useT } from '../i18n';
import Icon from './ui/Icon';
import LazyImage from './ui/LazyImage';
import ImageViewer from './ui/ImageViewer';

/**
 * Square photo thumbnail with an icon placeholder when there is no image.
 * `zoomable` turns it into a button that opens the photo full screen (`title` is shown in the viewer).
 */
export default function CafeThumb({ src, icon = 'local_cafe', size = 56, className = '', zoomable = false, title = '' }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = `flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-on-secondary-container ${className}`;
  const style = { width: size, height: size };

  if (!src) {
    return (
      <span className={box} style={style}>
        <Icon name={icon} size={Math.round(size * 0.45)} />
      </span>
    );
  }
  const img = <LazyImage src={src} className="h-full w-full" iconSize={Math.round(size * 0.4)} />;
  if (!zoomable) {
    return (
      <span className={box} style={style}>
        {img}
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={t('image.zoom')}
        title={t('image.zoom')}
        className={`${box} cursor-zoom-in transition-transform duration-200 active:scale-95`}
        style={style}
      >
        {img}
      </button>
      <ImageViewer src={open ? src : ''} title={title} onClose={() => setOpen(false)} />
    </>
  );
}
