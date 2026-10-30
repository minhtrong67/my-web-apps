/**
 * Khung trang dùng chung — một nơi duy nhất quy định chiều rộng, padding và nhịp khoảng cách
 * (lưới 8px): lề 16px (di động) → 24px (sm) → 32px (lg).
 */
export function Page({ children, wide = false, className = '' }) {
  return (
    <div
      className={`mx-auto w-full pb-4 pt-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pt-10 lg:px-8 ${
        wide ? 'max-w-5xl 2xl:max-w-6xl' : 'max-w-3xl'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/** Tiêu đề trang Expressive: chữ lớn, đậm, tracking âm; chữ đầu hạ độ đậm dần xuống phụ đề. */
export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-headline-lg text-on-surface sm:text-display-md">{title}</h1>
        {subtitle && <p className="mt-1.5 text-body-lg text-on-surface-variant">{subtitle}</p>}
      </div>
      {children}
    </header>
  )
}
