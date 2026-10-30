import { Check } from 'lucide-react'

/** Công tắc Material 3: thumb to dần khi nhấn, hiện dấu tích khi bật. */
export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`group relative inline-flex items-center w-[52px] h-8 rounded-full border-2 transition-colors duration-300 shrink-0 ${
        checked
          ? 'bg-[var(--md-primary)] border-[var(--md-primary)]'
          : 'bg-[var(--md-surface-container-highest)] border-[var(--md-outline)]'
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full transition-all duration-300 ease-[var(--ease-spring)] group-active:w-7 group-active:h-7 ${
          checked
            ? 'w-6 h-6 translate-x-[22px] bg-[var(--md-on-primary)] text-[var(--md-primary)]'
            : 'w-4 h-4 translate-x-[6px] bg-[var(--md-outline)]'
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  )
}
