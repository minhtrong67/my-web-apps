import Icon from './ui/Icon';

/** Square photo thumbnail with an icon placeholder when there is no image. */
export default function CafeThumb({ src, icon = 'local_cafe', size = 56, className = '' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-on-secondary-container ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" /> : <Icon name={icon} size={Math.round(size * 0.45)} />}
    </span>
  );
}
