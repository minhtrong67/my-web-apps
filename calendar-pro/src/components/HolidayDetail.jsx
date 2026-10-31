import Icon from './Icon'
import RollingNumber from './RollingNumber'
import WavyProgress from './WavyProgress'
import { holidayIconName } from '../lib/iconMap'
import { diffParts, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

export default function HolidayDetail({ holiday, nextDate }) {
  const now = useNow(1000)
  const { t, lang } = useTranslation()
  const iconName = holidayIconName(holiday.icon)
  const { days, hours, minutes, seconds } = diffParts(nextDate, now)
  const isTodayEvent = days === 0
  const progress = 1 - Math.min(days, 365) / 365

  return (
    <div className="flex flex-col gap-3">
      <div className="fx-shine relative overflow-hidden rounded-[32px] bg-primary p-5 text-on-primary">
        <span className="fx-spin-slow shape-sunny pointer-events-none absolute -right-12 -top-12 h-44 w-44 bg-primary-container opacity-25" aria-hidden="true" />
        <div className="relative">
          <div className="shape-cookie flex h-14 w-14 items-center justify-center bg-primary-container text-on-primary-container">
            <Icon name={iconName} size={28} filled />
          </div>
          <h3 className="mt-4 text-headline-sm">{holiday.name}</h3>
          <CategoryBadge category={holiday.category} className="mt-3 !bg-surface-lowest !text-on-surface" />
        </div>
      </div>

      {isTodayEvent ? (
        <div className="rounded-3xl bg-primary py-5 text-center text-title-lg text-on-primary">{t('countdown.occursToday')}</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            <TimeBox value={days} label={t('common.day')} strong />
            <TimeBox value={hours} label={t('common.hour')} />
            <TimeBox value={minutes} label={t('common.minute')} />
            <TimeBox value={seconds} label={t('common.second')} />
          </div>
          <WavyProgress value={progress} className="px-1" />
        </>
      )}

      {/* Danh sách: icon dẫn đầu + dòng chính + dòng phụ */}
      <div className="overflow-hidden rounded-3xl bg-surface-container">
        <ListItem icon="event" overline={t('holidayDetail.lastOccurrence')} text={formatVNDate(nextDate, lang)} />
        <div className="mx-4 h-px bg-outline-variant" />
        <ListItem
          icon="sell"
          overline={t('holidayDetail.calendarType')}
          text={`${holiday.type === 'solar' ? t('holidayDetail.bySolar') : t('holidayDetail.byLunar')} — ${holiday.day}/${holiday.month}`}
        />
      </div>

      <div className="rounded-3xl bg-surface-container p-4">
        <p className="text-title-sm text-on-surface">{t('holidayDetail.meaning')}</p>
        <p className="mt-1.5 text-body-md text-on-surface-variant">{holiday.desc}</p>
      </div>

    </div>
  )
}

function ListItem({ icon, overline, text }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
        <Icon name={icon} size={22} filled />
      </span>
      <div>
        <p className="text-body-sm text-on-surface-variant">{overline}</p>
        <p className="text-body-lg text-on-surface">{text}</p>
      </div>
    </div>
  )
}

function TimeBox({ value, label, strong = false }) {
  return (
    <div className={`rounded-3xl py-3 text-center ${strong ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'}`}>
      <RollingNumber value={value} pad={2} className="text-headline-md font-bold" />
      <p className="text-label-sm opacity-80">{label}</p>
    </div>
  )
}
