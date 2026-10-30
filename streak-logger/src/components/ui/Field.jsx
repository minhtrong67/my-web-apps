export default function Field({ label, hint, error, required, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 last:mb-0">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--md-on-surface)] px-1">
          {label} {required && <span className="text-[var(--md-error)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-[var(--md-on-surface-variant)] px-1">{hint}</span>}
      {error && <span role="alert" className="text-xs font-medium text-[var(--md-error)] px-1 anim-pop">{error}</span>}
    </div>
  )
}
