import { ChevronDown, FilterX } from 'lucide-react'
import { useSettings } from '../lib/app-context.jsx'
import { GROUPS, GROUP_VALUES, valueLabel } from '../lib/search.js'
import { FilterChip, cx } from './ui.jsx'

/* Nội dung bộ lọc: dùng trong sidebar (desktop) và bottom sheet (mobile) */
export default function FilterPanel({ sel, onToggle, onClear, activeCount, children, className }) {
  const { t } = useSettings()
  return (
    <div className={cx('flex min-h-0 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[3px] border-primary px-4 pb-3 pt-3">
        <h2 className="text-xl font-extrabold italic tracking-tight">{t('filter.title')}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button" onClick={onClear} disabled={!activeCount}
            className="slant inline-flex h-9 items-center gap-1.5 bg-primary-container px-5 text-sm font-bold italic text-on-primary-container transition-all hover:bg-primary hover:text-on-primary active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          ><FilterX size={16} />{t('filter.clear')}</button>
          {children}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-1">
        {GROUPS.map((g) => {
          const n = sel[g.k].length
          return (
            <details key={g.k} open={g.open} className="border-b border-dashed border-outline-variant last:border-0">
              <summary className="flex cursor-pointer select-none items-center justify-between gap-2 px-1 py-3 font-bold italic transition-colors hover:text-primary">
                <span className="flex items-center gap-2">
                  <span className="slant h-4 w-2 bg-primary [--s:3px]" />
                  {t(`g.${g.k}`)}
                  {n > 0 && <span className="slant grid h-5 min-w-6 place-items-center bg-hl px-2 text-[0.7rem] font-extrabold not-italic text-on-hl [--s:4px]">{n}</span>}
                </span>
                <ChevronDown size={18} className="chev text-primary transition-transform duration-300 ease-out-back" />
              </summary>
              <div className="flex flex-wrap gap-1.5 px-1 pb-3 pt-0.5">
                {GROUP_VALUES[g.k].map(({ v, sample }) => (
                  <FilterChip key={v} selected={sel[g.k].includes(v)} onClick={() => onToggle(g.k, v)}>
                    {valueLabel(g, v, sample, t)}
                  </FilterChip>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
