import { useCallback, useMemo, useState } from 'react'
import CountdownCard from '../components/CountdownCard'
import Sheet from '../components/Sheet'
import HolidayDetail from '../components/HolidayDetail'
import { Page, PageHeader } from '../components/Page'
import { HOLIDAYS, CATEGORY_LABEL } from '../data/holidays'
import { getNextOccurrence } from '../lib/dateUtils'
import { useTranslation } from '../i18n/useTranslation'

export default function CountdownPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const today = useMemo(() => new Date(), [])

  const FILTERS = useMemo(
    () => [{ id: 'all', label: t('countdown.filterAll') }, ...Object.keys(CATEGORY_LABEL).map((id) => ({ id, label: t(`category.${id}`) }))],
    [t]
  )

  // Tính ngày diễn ra kế tiếp 1 lần; đổi bộ lọc chỉ lọc lại danh sách
  const all = useMemo(
    () =>
      HOLIDAYS.map((h) => ({ holiday: h, next: getNextOccurrence(h, today) }))
        .filter((x) => x.next)
        .sort((a, b) => a.next - b.next),
    [today]
  )
  const items = useMemo(() => (filter === 'all' ? all : all.filter((x) => x.holiday.category === filter)), [all, filter])

  const openHoliday = useCallback((holiday, next) => setSelected({ holiday, next }), [])
  const closeHoliday = useCallback(() => setSelected(null), [])

  return (
    <Page wide>
      <PageHeader title={t('countdown.title')} subtitle={t('countdown.desc')} />

      {/* Bộ lọc danh mục */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0" role="group">
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={`state focus-ring flex h-9 shrink-0 items-center rounded-lg border px-3.5 text-label-lg ${
                active ? 'border-transparent bg-primary text-on-primary' : 'border-outline-variant text-ink-soft'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <section className="mt-4 sm:mt-6">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-outline-variant bg-card shadow-soft p-10 text-center text-body-md text-ink-soft">{t('countdown.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {items.map(({ holiday, next }, i) => (
              <CountdownCard key={holiday.id} holiday={holiday} nextDate={next} index={i} onSelect={openHoliday} />
            ))}
          </div>
        )}
      </section>

      <Sheet open={!!selected} onClose={closeHoliday} title={t('countdown.eventDetail')}>
        {selected && <HolidayDetail holiday={selected.holiday} nextDate={selected.next} />}
      </Sheet>
    </Page>
  )
}
