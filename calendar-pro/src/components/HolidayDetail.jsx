import Icon from './Icon'
import Button from './Button'
import { holidayIconName } from '../lib/iconMap'
import { diffParts, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useSettings } from '../contexts/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'

export default function HolidayDetail({ holiday, nextDate }) {
  const now = useNow(1000)
  const { settings, update } = useSettings()
  const { t, lang } = useTranslation()
  const iconName = holidayIconName(holiday.icon)
  const { days, hours, minutes, seconds } = diffParts(nextDate, now)
  const isTodayEvent = days === 0
  const isNotifyOn = settings.notifyHolidayIds.includes(holiday.id)

  function toggleNotify() {
    const set = new Set(settings.notifyHolidayIds)
    if (set.has(holiday.id)) set.delete(holiday.id)
    else set.add(holiday.id)
    update({ notifyHolidayIds: Array.from(set) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl p-5 text-on-primary" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' }}>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-on-primary/20">
          <Icon name={iconName} size={24} />
        </div>
        <h3 className="mt-4 text-headline-sm">{holiday.name}</h3>
        <CategoryBadge category={holiday.category} className="mt-3 !border-transparent bg-card" />
      </div>

      {isTodayEvent ? (
        <div className="rounded-xl bg-primary py-5 text-center text-title-lg text-on-primary">{t('countdown.occursToday')}</div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <TimeBox value={days} label={t('common.day')} />
          <TimeBox value={hours} label={t('common.hour')} />
          <TimeBox value={minutes} label={t('common.minute')} />
          <TimeBox value={seconds} label={t('common.second')} />
        </div>
      )}

      {/* Danh sách: icon dẫn đầu + dòng chính + dòng phụ */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-card shadow-soft">
        <ListItem icon="event" overline={t('holidayDetail.lastOccurrence')} text={formatVNDate(nextDate, lang)} />
        <div className="mx-4 h-px bg-outline-variant" />
        <ListItem
          icon="sell"
          overline={t('holidayDetail.calendarType')}
          text={`${holiday.type === 'solar' ? t('holidayDetail.bySolar') : t('holidayDetail.byLunar')} — ${holiday.day}/${holiday.month}`}
        />
      </div>

      <div className="rounded-xl border border-outline-variant bg-card shadow-soft p-4">
        <p className="text-title-sm text-ink">{t('holidayDetail.meaning')}</p>
        <p className="mt-1.5 text-body-md text-ink-soft">{holiday.desc}</p>
      </div>

      <Button
        variant={isNotifyOn ? 'primary' : 'outline'}
        size="lg"
        className="mt-1 w-full"
        icon={(p) => <Icon name={isNotifyOn ? 'notifications_active' : 'notifications'} {...p} />}
        onClick={toggleNotify}
        aria-pressed={isNotifyOn}
      >
        {isNotifyOn ? t('holidayDetail.notifyOn') : t('holidayDetail.notifyOff')}
      </Button>
    </div>
  )
}

function ListItem({ icon, overline, text }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Icon name={icon} size={22} className="text-ink-soft" />
      <div>
        <p className="text-body-sm text-ink-soft">{overline}</p>
        <p className="text-body-lg text-ink">{text}</p>
      </div>
    </div>
  )
}

function TimeBox({ value, label }) {
  return (
    <div className="rounded-xl bg-primary-container py-3 text-center">
      <p className="num text-headline-md text-on-primary-container">{String(value).padStart(2, '0')}</p>
      <p className="text-label-sm text-on-primary-container/80">{label}</p>
    </div>
  )
}
