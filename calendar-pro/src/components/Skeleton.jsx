export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant bg-card p-4">
      <Skeleton className="mb-3 h-10 w-10" />
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant bg-card p-3 sm:p-5">
      <div className="mb-3 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-3 w-6" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Khung chờ cho trang được nạp lười (lazy) — gần như không bao giờ thấy nhờ prefetch lúc rảnh */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 sm:pt-10" aria-busy="true">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-32" />
      <Skeleton className="h-64 !rounded-2xl" />
    </div>
  )
}
