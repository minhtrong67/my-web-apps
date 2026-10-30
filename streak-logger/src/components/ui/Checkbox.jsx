import { Check } from 'lucide-react'

/**
 * Checkbox tự vẽ thay cho `<input type="checkbox">` gốc để đồng nhất giữa các trình duyệt
 * và theo đúng màu chủ đề sáng/tối. Ô vuông bo 6px, tick bật lên bằng hiệu ứng lò xo.
 */
export default function Checkbox({ checked, onChange, label, className = '', ...props }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <span className="relative inline-flex shrink-0 items-center justify-center w-10 h-10 -m-2 rounded-full">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" {...props} />
        <span className="w-[22px] h-[22px] rounded-[6px] border-2 border-[var(--md-on-surface-variant)] flex items-center justify-center transition-all duration-200 ease-[var(--ease-spring)] hover:border-[var(--md-primary)] peer-checked:border-[var(--md-primary)] peer-checked:bg-[var(--md-primary)] peer-focus-visible:ring-4 peer-focus-visible:ring-[color-mix(in_oklab,var(--md-primary)_30%,transparent)]">
          <Check
            size={15}
            strokeWidth={3.5}
            className={`text-[var(--md-on-primary)] transition-transform duration-300 ease-[var(--ease-spring)] ${checked ? 'scale-100' : 'scale-0'}`}
          />
        </span>
      </span>
      {label && <span className="text-sm text-[var(--md-on-surface)]">{label}</span>}
    </label>
  )
}
