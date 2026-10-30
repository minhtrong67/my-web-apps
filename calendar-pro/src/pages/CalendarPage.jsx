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
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-start xl:gap-6">
      <div className="min-w-0">
      <header className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          <h1 key={`${cursor.year}-${cursor.month}`} className={`text-headline-lg text-on-surface sm:text-display-md ${slideClass}`}>
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </h1>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-body-lg text-on-surface-variant">
            <Icon name="bedtime" size={18} filled className="text-tertiary" />
            {t('calendar.yearLabel', canChiYear(lunarYear), lunarYear)}
          </p>
        </div>
        {/* Connected button group: 2 nút liền nhau, bo ngoài tròn - bo trong nhỏ; nhấn thì biến hình */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={() => changeMonth(-1)} className="state focus-ring flex h-12 w-14 items-center justify-center rounded-l-full rounded-r-lg bg-secondary-container text-on-secondary-container transition-[border-radius,transform] duration-spatial-fast ease-spatial-fast active:scale-95 active:rounded-r-3xl" aria-label={t('calendar.prevMonth')}>
            <Icon name="chevron_left" size={26} weight={500} />
          </button>
          <button onClick={() => changeMonth(1)} className="state focus-ring flex h-12 w-14 items-center justify-center rounded-l-lg rounded-r-full bg-secondary-container text-on-secondary-container transition-[border-radius,transform] duration-spatial-fast ease-spatial-fast active:scale-95 active:rounded-l-3xl" aria-label={t('calendar.nextMonth')}>
            <Icon name="chevron_right" size={26} weight={500} />
          </button>
        </div>
      </header>

      <section className="rounded-[32px] bg-surface-container p-2 min-[360px]:p-3 sm:p-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={`${cursor.year}-${cursor.month}`} className={slideClass}>
          <CalendarGrid year={cursor.year} month={cursor.month} selectedDate={selected} onSelect={handleSelect} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 px-1 pt-2 text-label-md text-on-surface-variant">
          <LegendDot color="bg-primary" label={t('calendar.legendToday')} />
          <span className="rounded-full bg-surface-high px-3 py-1.5 font-bold text-on-surface">{t('calendar.legendLunarMark')}</span>
          <LegendDot color="bg-chay" label={t('calendar.legendVegetarian')} />
          <LegendDot color="bg-holiday" label={t('calendar.legendHoliday')} />
          <span className="rounded-full bg-surface-high px-3 py-1.5 text-error">{t('calendar.legendSunday')}</span>
        </div>
      </section>
      </div>

      {/* Màn hình rộng: chi tiết ngày đang chọn hiển thị cố định bên phải */}
      <aside className="hidden xl:sticky xl:top-8 xl:block" aria-label={t('calendar.dayDetail')}>
        {selected && <VanNienDetail date={selected} />}
      </aside>
      </div>

      {/* FAB mở rộng: về hôm nay */}
      <button
        onClick={goToday}
        className="state morph-square focus-ring animate-pop-in fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] right-4 z-30 flex h-14 items-center gap-2.5 rounded-[20px] bg-primary-container px-4 text-on-primary-container shadow-fab sm:bottom-8 sm:right-8 sm:px-5"
        aria-label={t('calendar.goToday')}
      >
        <Icon name="today" size={26} filled />
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
    <span className="flex items-center gap-2 rounded-full bg-surface-high px-3 py-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
