import Icon from './Icon';

const VARIANTS = {
  standard: 'text-on-surface-variant',
  filled: 'bg-primary text-on-primary',
  tonal: 'bg-secondary-container text-on-secondary-container',
  outlined: 'border border-outline text-on-surface-variant',
  danger: 'text-error',
};

/** 40px round icon button (squares up while pressed). `label` becomes the accessible name + tooltip. */
export default function IconButton({ icon, label, variant = 'standard', size = 24, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`state-layer morph inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
