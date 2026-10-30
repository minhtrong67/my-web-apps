import Icon from './Icon';

/**
 * M3 Expressive connected button group: pill-shaped buttons joined by a 2dp gap; the selected
 * one is a fully-rounded filled pill, the others have squarer inner corners.
 * options: [{ id, label, icon?, activeClass? }]
 * `activeClass` lets a segment use semantic colours (e.g. income / expense).
 */
export default function SegmentedButton({ options, value, onChange, className = '', ariaLabel }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`flex w-full gap-0.5 ${className}`}>
      {options.map((o, i) => {
        const active = o.id === value;
        const n = options.length;
        const shape = n === 1 ? 'rounded-full' : i === 0 ? 'rounded-l-full rounded-r-md' : i === n - 1 ? 'rounded-l-md rounded-r-full' : 'rounded-md';
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`state-layer flex min-h-10 flex-1 items-center justify-center gap-1.5 px-4 py-1 text-label-lg transition-[background-color,color,border-radius] duration-300 ease-spatial ${
              active
                ? `rounded-full ${o.activeClass || 'bg-primary text-on-primary'}`
                : `${shape} bg-surface-container-high text-on-surface-variant`
            }`}
          >
            {active ? <Icon name="check" size={18} /> : o.icon ? <Icon name={o.icon} size={18} /> : null}
            <span className="wrap-any">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
