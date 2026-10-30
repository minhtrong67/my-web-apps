import { Loader2 } from 'lucide-react'

/**
 * Nút Material 3 Expressive: bo tròn hết cỡ, "biến hình" sang góc vuông hơn khi nhấn,
 * có ripple và state layer. Màu nền theo vai trò để nhận diện hành động ngay:
 *   primary = hành động chính, tonal = phụ, secondary = trung tính (Hủy),
 *   danger = xóa, warning = cẩn trọng (đăng xuất, đặt lại), success, info.
 */
const variants = {
  primary: 'bg-[var(--md-primary)] text-[var(--md-on-primary)]',
  tonal: 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]',
  secondary: 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)]',
  ghost: 'bg-transparent text-[var(--md-primary)]',
  danger: 'bg-[var(--md-error)] text-[var(--md-on-error)]',
  dangerSoft: 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]',
  success: 'bg-[var(--md-success)] text-[var(--md-on-success)]',
  warning: 'bg-[var(--md-warning)] text-[var(--md-on-warning)]',
  info: 'bg-[var(--md-info)] text-[var(--md-on-info)]',
  outline: 'bg-transparent border border-[var(--md-outline)] text-[var(--md-on-surface)]',
}

const sizes = {
  sm: 'h-8 text-xs px-3.5 gap-1.5 rounded-[16px] active:rounded-[8px]',
  md: 'h-10 text-sm px-5 gap-2 rounded-[20px] active:rounded-[10px]',
  lg: 'h-12 text-base px-6 gap-2.5 rounded-[24px] active:rounded-[12px]',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight = false,
  loading = false,
  className = '',
  children,
  disabled,
  type,
  ...props
}) {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18
  const isDisabled = disabled || loading
  return (
    <As
      type={As === 'button' ? (type || 'button') : type}
      className={`m3-ripple morph inline-flex items-center justify-center font-semibold tracking-[0.01em] whitespace-nowrap select-none disabled:opacity-45 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSize} className="shrink-0 animate-spin" />
      ) : (
        Icon && !iconRight && <Icon size={iconSize} className="shrink-0" />
      )}
      {children}
      {!loading && Icon && iconRight && <Icon size={iconSize} className="shrink-0" />}
    </As>
  )
}
