import { useT } from '../../i18n';
import Icon from './Icon';
import Field from './Field';

/** 0-5 star picker (tap the current star again to reset to 0). */
export function Stars({ value, size = 16, className = '' }) {
  const v = Number(value) || 0;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${v}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} fill={n <= v} className={n <= v ? 'text-amber-500' : 'text-outline'} />
      ))}
    </span>
  );
}

export default function RatingInput({ label, value, onChange, error }) {
  const t = useT();
  const v = Number(value) || 0;
  return (
    <Field label={label} error={error}>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === v}
            aria-label={t('cafe.starsN', { n })}
            onClick={() => onChange(n === v ? 0 : n)}
            className="state-layer flex h-10 w-10 items-center justify-center rounded-full"
          >
            <Icon name="star" size={28} fill={n <= v} className={n <= v ? 'text-amber-500' : 'text-outline'} />
          </button>
        ))}
        <span className="ml-2 text-label-lg text-on-surface-variant">{v > 0 ? `${v}/5` : t('cafe.noRating')}</span>
      </div>
    </Field>
  );
}
