import { forwardRef } from 'react'

/** Ô nhập kiểu "filled" của Material 3: nền tonal, bo 16px, viền chuyển màu khi focus. */
export const fieldBase =
  'w-full rounded-[var(--radius-control)] border-2 border-transparent bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] placeholder:opacity-70 px-4 py-3 text-sm outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-[var(--md-primary)] focus:bg-[var(--md-surface-container-low)] aria-[invalid=true]:border-[var(--md-error)]'

const Input = forwardRef(function Input({ className = '', icon: Icon, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--md-on-surface-variant)] pointer-events-none" />
      )}
      <input ref={ref} className={`${fieldBase} ${Icon ? 'pl-11' : ''} ${className}`} {...props} />
    </div>
  )
})

export default Input
