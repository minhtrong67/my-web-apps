import Icon from './Icon'

/** Ô chọn kiểu "filled" của Material 3: nền tonal bo 16px, nhãn nhỏ nằm trong ô, vạch nhấn màu chủ đạo khi focus. */
export default function SelectField({ label, value, onChange, children, className = '', ...props }) {
  return (
    <label className={`group relative block min-w-0 ${className}`}>
      <span className="pointer-events-none absolute left-4 top-2 z-10 text-label-sm text-on-surface-variant transition-colors group-focus-within:text-primary">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="num h-14 w-full min-w-0 appearance-none rounded-2xl bg-surface-high pb-1 pl-4 pr-10 pt-5 text-body-lg font-medium text-on-surface outline-none transition-[background-color,box-shadow] duration-effects ease-effects hover:bg-surface-highest focus:bg-surface-highest focus:shadow-[inset_0_-2px_0_var(--primary)]"
        {...props}
      >
        {children}
      </select>
      <Icon name="expand_more" size={24} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-transform duration-spatial-fast ease-spatial-fast group-focus-within:rotate-180" />
    </label>
  )
}
