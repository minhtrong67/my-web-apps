export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="display-title text-3xl sm:text-4xl text-[var(--md-on-surface)]">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[var(--md-on-surface-variant)] mt-1.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
