import Icon from './Icon'

/**
 * Switch Expressive: track 52×32, thumb tròn to dần (16 → 24px) khi bật và phồng lên 28px khi nhấn giữ,
 * có dấu tích bên trong. Chỉ dùng transform nên mượt; chuyển động dùng spring nảy nhẹ.
 * Vùng chạm được nới ra (pseudo-element) để đủ lớn cho ngón tay.
 */
export default function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group focus-ring relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border-2 transition-colors duration-effects ease-effects before:absolute before:-inset-2 before:content-[''] disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'border-primary bg-primary' : 'border-outline bg-surface-highest'
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 -mt-3 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-spatial-fast ease-spatial-fast group-active:scale-[1.18] ${
          checked ? 'translate-x-[22px] bg-on-primary text-primary' : 'translate-x-[4px] scale-[0.67] bg-outline text-surface-highest'
        }`}
      >
        <Icon
          name="check"
          size={16}
          weight={600}
          className={`transition-opacity duration-effects ease-effects ${checked ? 'opacity-100' : 'opacity-0'}`}
        />
      </span>
    </button>
  )
}
