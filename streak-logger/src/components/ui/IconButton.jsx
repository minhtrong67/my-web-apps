const tones = {
  primary: 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]',
  info: 'bg-[var(--md-info-container)] text-[var(--md-on-info-container)]',
  success: 'bg-[var(--md-success-container)] text-[var(--md-on-success-container)]',
  danger: 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]',
  neutral: 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]',
}

/**
 * Nút biểu tượng. `tone` tạo nút nền tonal luôn hiển thị (dùng cho thao tác trên dòng bảng,
 * nhận diện được ngay không cần rê chuột). Bỏ `tone` sẽ là nút biểu tượng trong suốt.
 */
export default function IconButton({
  icon: Icon,
  label,
  active = false,
  tone,
  className = '',
  size = 18,
  ...props
}) {
  const toneClass = tone
    ? tones[tone] || tones.neutral
    : active
      ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
      : 'text-[var(--md-on-surface-variant)]'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`m3-ripple morph inline-flex items-center justify-center w-10 h-10 rounded-full active:rounded-[12px] ${toneClass} ${className}`}
      {...props}
    >
      <Icon size={size} />
    </button>
  )
}
