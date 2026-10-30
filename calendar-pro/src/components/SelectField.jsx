import Icon from './Icon'

/** Ô chọn có viền mảnh: nhãn nằm trên đường viền, đổi sang màu nhấn khi focus. */
export default function SelectField({ label, value, onChange, children, labelBg = 'bg-card', className = '', ...props }) {
  return (
    <label className={`group relative block min-w-0 ${className}`}>
      <span className={`pointer-events-none absolute -top-2 left-2.5 z-10 px-1 text-label-sm text-ink-soft transition-colors group-focus-within:text-ink ${labelBg}`}>
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="num h-12 w-full min-w-0 appearance-none rounded-lg border border-outline bg-transparent pl-3.5 pr-9 text-body-lg text-ink outline-none transition-colors hover:border-ink focus:border-primary focus:ring-1 focus:ring-primary"
        {...props}
      >
        {children}
      </select>
      <Icon name="expand_more" size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" />
    </label>
  )
}
