import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'
import CalendarGrid from '../components/CalendarGrid'
import Sheet from '../components/Sheet'
import VanNienDetail from '../components/VanNienDetail'
import { Page } from '../components/Page'
import { monthNames, getLunarInfo } from '../lib/dateUtils'
import { canChiYear } from '../lib/lunar'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTranslation } from '../i18n/useTranslation'

export default function CalendarPage() {
  const { t, lang } = useTranslation()
  const MONTH_NAMES = monthNames(lang)
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [direction, setDirection] = useState(null) // 'next' | 'prev' — hướng trượt khi đổi tháng
  const [selected, setSelected] = useState(today)
  const [sheetOpen, setSheetOpen] = useState(false)
  const touchRef = useRef(null)
  const isWide = useMediaQuery('(min-width: 1280px)') // ≥1280px: chi tiết ngày nằm cạnh lịch, không mở sheet

  const changeMonth = useCallback((delta) => {
    setDirection(delta > 0 ? 'next' : 'prev')
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }, [])

  const goToday = useCallback(() => {
    const now = new Date()
    setCursor((c) => {
      const delta = (now.getFullYear() - c.year) * 12 + now.getMonth() - c.month
      setDirection(delta === 0 ? null : delta > 0 ? 'next' : 'prev')
      return { year: now.getFullYear(), month: now.getMonth() }
    })
    setSelected(now)
  }, [])

  const handleSelect = useCallback((d) => {
    setSelected(d)
    setCursor((c) => (d.getMonth() !== c.month ? { year: d.getFullYear(), month: d.getMonth() } : c))
    if (!window.matchMedia('(min-width: 1280px)').matches) setSheetOpen(true)
  }, [])

  // Bàn phím: PageUp / PageDown để chuyển tháng
  useEffect(() => {
    function onKey(e) {
      if (sheetOpen || e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'PageDown') { e.preventDefault(); changeMonth(1) }
      else if (e.key === 'PageUp') { e.preventDefault(); changeMonth(-1) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [changeMonth, sheetOpen])

  // Cảm ứng: vuốt ngang để chuyển tháng (chỉ khi vuốt đủ xa và chủ yếu theo chiều ngang)
  const onTouchStart = (e) => {
    const touch = e.touches[0]
    touchRef.current = { x: touch.clientX, y: touch.clientY }
  }
  const onTouchEnd = (e) => {
    const start = touchRef.current
    touchRef.current = null
    if (!start) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) changeMonth(dx < 0 ? 1 : -1)
  }

  const { lunarYear } = getLunarInfo(new Date(cursor.year, cursor.month, 15))
  const slideClass = direction === 'next' ? 'slide-next' : direction === 'prev' ? 'slide-prev' : ''

  return (
    <Page wide className="!pb-20">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start xl:gap-6">
      <div className="min-w-0">
      <header className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
        <div className="min-w-0">
          <h1 className="text-headline-md text-ink sm:text-headline-lg">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </h1>
          <p className="text-body-md text-ink-soft">{t('calendar.yearLabel', canChiYear(lunarYear), lunarYear)}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <button onClick={() => changeMonth(-1)} className="state focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-ink-soft" aria-label={t('calendar.prevMonth')}>
            <Icon name="chevron_left" size={22} />
          </button>
          <button onClick={() => changeMonth(1)} className="state focus-ring ml-1.5 flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-ink-soft" aria-label={t('calendar.nextMonth')}>
            <Icon name="chevron_right" size={22} />
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-outline-variant bg-card shadow-soft p-2 min-[360px]:p-3 sm:p-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={`${cursor.year}-${cursor.month}`} className={slideClass}>
          <CalendarGrid year={cursor.year} month={cursor.month} selectedDate={selected} onSelect={handleSelect} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline-variant px-1 pt-4 text-label-md text-ink-soft">
          <LegendDot color="bg-primary" label={t('calendar.legendToday')} />
          <span className="font-semibold text-ink">{t('calendar.legendLunarMark')}</span>
          <LegendDot color="bg-emerald-500" label={t('calendar.legendVegetarian')} />
          <LegendDot color="bg-amber-500" label={t('calendar.legendHoliday')} />
          <span className="text-error">{t('calendar.legendSunday')}</span>
        </div>
      </section>
      </div>

      {/* Màn hình rộng: chi tiết ngày đang chọn hiển thị cố định bên phải */}
      <aside className="hidden xl:sticky xl:top-8 xl:block" aria-label={t('calendar.dayDetail')}>
        {selected && <VanNienDetail date={selected} />}
      </aside>
      </div>

      {/* Nút nổi: về hôm nay */}
      <button
        onClick={goToday}
        className="state focus-ring animate-pop fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-4 z-30 flex h-12 items-center gap-2.5 rounded-xl bg-primary px-3.5 text-on-primary shadow-elevated sm:bottom-8 sm:right-8 sm:px-4"
        aria-label={t('calendar.goToday')}
      >
        <Icon name="today" size={22} />
        <span className="hidden text-label-lg sm:inline">{t('calendar.goToday')}</span>
      </button>

      <Sheet open={sheetOpen && !isWide} onClose={() => setSheetOpen(false)} title={t('calendar.dayDetail')}>
        {selected && <VanNienDetail date={selected} />}
      </Sheet>
    </Page>
  )
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}
