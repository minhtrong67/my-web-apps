export const Sk = ({ className = '' }) => <div className={`sk ${className}`} aria-hidden="true" />

export function CardSkeleton({ view }) {
  if (view === 'list') {
    return (
      <div className="cut flex items-center gap-3 border border-line bg-surface p-2 pr-3" aria-hidden="true">
        <Sk className="h-16 w-16 shrink-0" />
        <div className="flex-1 space-y-2"><Sk className="h-5 w-1/2" /><div className="flex gap-1.5"><Sk className="h-5 w-14" /><Sk className="h-5 w-16" /></div></div>
      </div>
    )
  }
  return (
    <div className="cut border border-line bg-surface" aria-hidden="true">
      <Sk className="aspect-[4/5] w-full" />
      <div className="space-y-2 p-3"><Sk className="h-5 w-3/4" /><div className="flex gap-1.5"><Sk className="h-5 w-14" /><Sk className="h-5 w-16" /></div><Sk className="ml-auto h-7 w-16" /></div>
    </div>
  )
}

export const DetailSkeleton = () => (
  <div className="space-y-4" role="status" aria-label="loading">
    {[0, 1, 2].map((i) => (
      <div key={i} className="space-y-2"><Sk className="h-3 w-24" /><Sk className="h-4 w-full" /><Sk className="h-4 w-5/6" />{i === 1 && <Sk className="h-4 w-2/3" />}</div>
    ))}
  </div>
)
