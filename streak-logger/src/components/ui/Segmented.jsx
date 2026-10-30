/**
 * Nhóm nút kết nối (connected button group) của Material 3 Expressive, dùng để chọn
 * một giá trị trong vài lựa chọn (sáng/tối/hệ thống, cỡ chữ, ngôn ngữ...).
 * Mục đang chọn "biến hình" thành viên thuốc, các mục còn lại bo góc nhỏ.
 * options: [{ value, label, icon? }]
 */
export default function Segmented({ value, onChange, options, ariaLabel, className = '' }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`flex gap-1 ${className}`}>
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={`m3-ripple flex-1 min-w-0 flex items-center justify-center gap-2 h-12 px-3 text-sm font-semibold transition-[border-radius,background-color,color] duration-300 ease-[var(--ease-spring)] ${
              active
                ? 'rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                : 'rounded-[12px] bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]'
            }`}
          >
            {Icon && <Icon size={18} className="shrink-0" />}
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
