/** Huy hiệu nhỏ dạng viên thuốc. `tone` quyết định màu, dùng chung với màu các buổi trong ngày. */
const tones = {
  violet: 'bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]',
  primary: 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]',
  success: 'bg-[var(--md-success-container)] text-[var(--md-on-success-container)]',
  warning: 'bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)]',
  danger: 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]',
  info: 'bg-[var(--md-info-container)] text-[var(--md-on-info-container)]',
  neutral: 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]',
}

export default function Badge({ tone = 'primary', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 ${tones[tone] || tones.primary} ${className}`}>
      {children}
    </span>
  )
}
