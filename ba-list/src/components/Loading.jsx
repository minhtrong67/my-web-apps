import { useSettings } from '../lib/app-context.jsx'
import { cx } from './ui.jsx'

/* Vòng tròn loading kiểu Blue Archive: vòng halo nét đứt quay ngược + cung xanh quay + hai vạch chéo của logo */
export function HaloSpinner({ size = 64, className }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cx('halo-spinner text-primary', className)} role="progressbar" aria-label="Loading">
      <circle className="halo-out" cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 7" opacity=".5" />
      <circle className="halo-in" cx="32" cy="32" r="19" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="62 58" />
      <path className="halo-slash" d="M9 24 L55 15 M9 40 L55 49" stroke="var(--ba-hl)" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

/* Skeleton của thẻ học sinh (cùng hình dạng thẻ thật: ảnh vát chéo + dòng chữ + thẻ nhãn + chân thẻ) */
export function SkeletonCard({ index = 0 }) {
  return (
    <div style={{ animationDelay: `${index * 60}ms` }} className="flex animate-rise flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-low">
      <div className="skeleton skeleton-ring cut-bl aspect-[4/4.4]" />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-3">
        <div className="skeleton slant h-5 w-3/4 [--s:6px]" />
        <div className="skeleton slant h-4 w-1/2 [--s:6px]" />
        <div className="skeleton slant h-3 w-2/3 [--s:5px]" />
        <div className="mt-1 flex gap-1.5"><div className="skeleton slant h-5 w-16 [--s:5px]" /><div className="skeleton slant h-5 w-12 [--s:5px]" /></div>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-outline-variant px-3 py-2">
        <div className="skeleton slant h-4 w-14 [--s:5px]" />
        <div className="flex gap-1.5"><div className="skeleton slant size-10 [--s:6px]" /><div className="skeleton slant size-10 [--s:6px]" /></div>
      </div>
    </div>
  )
}

/* Màn hình chờ khi tải mã + dữ liệu học sinh: khung giao diện bằng skeleton + vòng halo ở giữa */
export function BootScreen() {
  const { t } = useSettings()
  return (
    <div className="min-h-dvh" aria-busy="true">
      <div className="border-b-[3px] border-primary bg-surface-low">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-3 px-4 lg:px-6">
          <div className="skeleton slant size-10 [--s:8px]" />
          <div className="skeleton slant mx-auto h-11 max-w-2xl flex-1 [--s:14px]" />
          <div className="skeleton slant size-12 [--s:9px]" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 pt-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <div className="skeleton hidden h-[70vh] rounded-md lg:block" />
        <div>
          <div className="flex gap-2"><div className="skeleton slant h-10 w-48 [--s:10px]" /><div className="skeleton slant h-10 w-12 [--s:10px]" /><div className="skeleton slant ml-auto h-10 w-24 [--s:10px]" /></div>
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(184px,1fr))] sm:gap-4">
            {Array.from({ length: 10 }, (_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-0 grid place-items-center">
        <div className="cut-bl-sm flex animate-pop flex-col items-center gap-3 border border-outline-variant bg-surface-low/95 px-12 pb-7 pt-6 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.45)]">
          <HaloSpinner size={76} />
          <p className="text-sm font-bold italic">{t('loading')}</p>
          <div className="slant h-1.5 w-40 overflow-hidden bg-surface-high [--s:4px]"><i className="load-bar block h-full w-2/5 bg-primary" /></div>
        </div>
      </div>
    </div>
  )
}
