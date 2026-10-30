import Icon from './Icon';

// M3 Expressive buttons: fully rounded, morphing to a squarer shape while pressed.
const VARIANTS = {
  filled: 'bg-primary text-on-primary',
  tonal: 'bg-secondary-container text-on-secondary-container',
  elevated: 'bg-surface-container-low text-primary shadow-elev-1',
  outlined: 'border border-outline text-primary',
  text: 'text-primary',
  danger: 'bg-error text-on-error',
  'outlined-danger': 'border border-outline text-error',
  'text-danger': 'text-error',
};

const SIZES = {
  sm: 'h-8 px-4 text-label-lg',
  md: 'h-10 px-6 text-label-lg',
  lg: 'h-14 px-8 text-title-md',
};

export default function Button({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`state-layer morph inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full disabled:cursor-not-allowed disabled:bg-on-surface/10 disabled:text-on-surface/40 disabled:shadow-none disabled:[border-color:transparent] ${VARIANTS[variant]} ${SIZES[size]} ${icon || loading ? '!pl-4' : ''} ${className}`}
      {...rest}
    >
      {loading ? <span className="m3-loader m3-loader-sm !bg-current" /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
