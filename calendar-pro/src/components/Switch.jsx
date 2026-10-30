/**
 * Switch tối giản: track 44×24, thumb 16px. Chỉ dùng transform để chuyển trạng thái nên mượt, không kích hoạt layout.
 * Vùng chạm được nới ra 8px mỗi phía (pseudo-element) để đủ lớn cho ngón tay mà nhìn vẫn gọn.
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
      className={`focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150 before:absolute before:-inset-2 before:content-[''] disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'border-primary bg-primary' : 'border-outline bg-transparent'
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 -mt-2 h-4 w-4 rounded-full transition-transform duration-150 ease-emphasized ${
          checked ? 'translate-x-[23px] bg-on-primary' : 'translate-x-[3px] bg-outline'
        }`}
      />
    </button>
  )
}
