import Icon from './Icon';

/** M3 filter chip: 8dp corners, secondary-container when selected. */
export default function Chip({ selected = false, onClick, children, icon, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`state-layer inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 text-label-lg transition-[background-color,border-color,border-radius] duration-300 ease-spatial ${
        selected
          ? 'border border-transparent bg-secondary-container text-on-secondary-container'
          : 'border border-outline-variant text-on-surface-variant'
      } ${className}`}
    >
      {selected ? <Icon name="check" size={18} /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
