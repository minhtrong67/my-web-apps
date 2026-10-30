import Loader from './Loader'

// Nút Expressive: hình viên thuốc (pill), nhấn thì "biến hình" sang bo vừa rồi nảy lại bằng spring.
// 5 kiểu: primary (đặc), secondary (tonal), tertiary (tonal màu thứ ba), outline (viền), ghost (chữ).
const VARIANTS = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
  outline: 'border border-outline text-primary',
  ghost: 'text-primary'
}

const SIZES = {
  sm: 'h-10 px-4 text-label-lg gap-2',
  md: 'h-12 px-6 text-title-sm gap-2',
  lg: 'h-14 px-8 text-title-md gap-2.5'
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
      className={`state morph focus-ring inline-flex shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${Icon || loading ? '!pl-4' : ''} ${className}`}
      {...props}
    >
      {loading ? <Loader size={20} tone="container" /> : Icon ? <Icon size={20} /> : null}
      {children}
    </button>
  )
}
