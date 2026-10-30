export default function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="page-enter flex flex-col items-center justify-center text-center py-16 px-6 rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)]">
      {Icon && (
        <div className="anim-float w-20 h-20 rounded-[28px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] flex items-center justify-center mb-5">
          <Icon size={34} />
        </div>
      )}
      <p className="text-base text-[var(--md-on-surface-variant)] max-w-xs leading-relaxed">{title}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
