import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import VanNienDetail from '../components/VanNienDetail'
import CountdownCard from '../components/CountdownCard'
import Sheet from '../components/Sheet'
import HolidayDetail from '../components/HolidayDetail'
import Button from '../components/Button'
import { Page, PageHeader } from '../components/Page'
import { HOLIDAYS } from '../data/holidays'
import { getNextOccurrence, getLunarInfo, weekdaysShort, sameDay, mondayIndex, addDays } from '../lib/dateUtils'
import { useNow } from '../hooks/useNow'
import { useToast } from '../contexts/ToastContext'
import { useTranslation } from '../i18n/useTranslation'

export default function HomePage() {
  const { t, lang } = useTranslation()
  const WEEKDAYS_SHORT = weekdaysShort(lang)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState(null)
  const { notify } = useToast()
  const now = useNow(60000) // "hôm nay" tự cập nhật khi qua nửa đêm
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const today = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const { lunarDay: todayLunarDay } = useMemo(() => getLunarInfo(today), [today])

  const upcoming = useMemo(() => {
    return HOLIDAYS.map((h) => ({ holiday: h, next: getNextOccurrence(h, today) }))
      .filter((x) => x.next)
      .sort((a, b) => a.next - b.next)
      .slice(0, 6)
  }, [today])

  const weekStrip = useMemo(() => {
    const start = addDays(today, -mondayIndex(today.getDay()))
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i)
      return { date: d, lunarDay: getLunarInfo(d).lunarDay }
    })
  }, [today])

  const openHoliday = useCallback((holiday, next) => setSelected({ holiday, next }), [])
  const closeHoliday = useCallback(() => setSelected(null), [])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      notify(t('home.refreshSuccess'), { type: 'success', title: t('home.refreshSuccessTitle') })
    }, 500)
  }

  return (
    <Page wide>
      <div className="hidden sm:block">
        <PageHeader title={t('home.greeting')} subtitle={t('home.greetingDesc')}>
          <Button variant="secondary" icon={(p) => <Icon name="refresh" {...p} />} loading={refreshing} onClick={handleRefresh}>
            {t('home.refresh')}
          </Button>
        </PageHeader>
      </div>

      {/* Dải ngày trong tuần (Thứ Hai -> Chủ Nhật) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="list">
        {weekStrip.map(({ date, lunarDay }, i) => {
          const isToday = sameDay(date, today)
          return (
            <div
              key={date.getTime()}
              role="listitem"
              aria-current={isToday ? 'date' : undefined}
              style={{ '--i': i }}
              className={`stagger-item flex flex-col items-center gap-1 rounded-[24px] py-3.5 sm:rounded-[28px] ${isToday ? 'bg-primary text-on-primary shadow-fab' : 'bg-surface-container text-on-surface'}`}
            >
              <span className={`text-label-md ${isToday ? 'opacity-85' : date.getDay() === 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                {WEEKDAYS_SHORT[i]}
              </span>
              <span className="num text-title-lg font-bold">{date.getDate()}</span>
              <span className={`num text-label-sm ${isToday ? 'opacity-85' : 'text-on-surface-variant'}`}>{lunarDay}</span>
            </div>
          )
        })}
      </div>

      {/* Hai cột trên màn hình rộng: thông tin hôm nay | sự kiện, ngày chay, gợi ý */}
      <div className="mt-4 grid gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <section aria-label={t('common.today')}>
          <VanNienDetail date={today} />
        </section>

        <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
          {/* Ngày lễ sắp tới */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-headline-sm text-on-surface">{t('home.upcomingEvents')}</h2>
              <Link to="/dem-nguoc" className="state morph focus-ring flex h-10 items-center gap-0.5 rounded-full pl-4 pr-3 text-label-lg text-primary">
                {t('home.viewAll')} <Icon name="chevron_right" size={18} />
              </Link>
            </div>
            <div className="-mx-4 flex snap-x snap-proximity scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:-mx-6 sm:px-6 sm:scroll-pl-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
              {upcoming.map(({ holiday, next }, i) => (
                <CountdownCard key={holiday.id} holiday={holiday} nextDate={next} compact index={i} onSelect={openHoliday} />
              ))}
            </div>
          </section>

          {/* Ngày chay trong tháng */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className="shape-scallop flex h-12 w-12 items-center justify-center bg-chay-container text-on-chay-container">
                <Icon name="eco" size={24} filled />
              </div>
              <div>
                <h2 className="text-headline-sm leading-tight text-on-surface">{t('home.vegetarianTitle')}</h2>
                <p className="text-body-sm text-on-surface-variant">{t('home.vegetarianSubtitle')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { day: 1, label: t('home.firstDay'), desc: t('home.firstDayDesc') },
                { day: 15, label: t('home.fullMoon'), desc: t('home.fullMoonDesc') }
              ].map(({ day, label, desc }) => {
                const isTodayChay = day === todayLunarDay
                return (
                  <div
                    key={day}
                    className={`lift fx-spot flex flex-col gap-1 rounded-[28px] p-5 ${
                      isTodayChay ? 'bg-primary text-on-primary' : 'bg-chay-container text-on-chay-container'
                    }`}
                  >
                    <p className="text-headline-sm">{label}</p>
                    <p className={`text-body-sm ${isTodayChay ? 'opacity-85' : 'opacity-80'}`}>{desc}</p>
                    {isTodayChay && <span className="mt-2 w-fit rounded-full bg-on-primary/20 px-3 py-1 text-label-md">{t('common.today')}</span>}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>

      <Sheet fullScreen open={!!selected} onClose={closeHoliday} title={t('countdown.eventDetail')}>
        {selected && <HolidayDetail holiday={selected.holiday} nextDate={selected.next} />}
      </Sheet>
    </Page>
  )
}
