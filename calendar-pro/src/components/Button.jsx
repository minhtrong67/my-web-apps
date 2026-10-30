import MaterialIcon from './Icon'

// 4 kiểu nút: primary (đặc, màu nhấn), secondary (nền xám nhạt), outline (viền mảnh), ghost (chỉ chữ).
const VARIANTS = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary-container text-on-secondary-container',
  outline: 'border border-outline/50 text-ink',
  ghost: 'text-ink'
}

const SIZES = {
  sm: 'h-8 px-3 text-label-md gap-1.5',
  md: 'h-10 px-4 text-label-lg gap-2',
  lg: 'h-11 px-5 text-label-lg gap-2'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`state focus-ring inline-flex shrink-0 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${Icon || loading ? '!pl-3.5' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <MaterialIcon name="progress_activity" size={18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={18} />
      ) : null}
      {children}
    </button>
  )
}
