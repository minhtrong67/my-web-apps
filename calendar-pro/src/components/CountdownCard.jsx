import { memo } from 'react'
import Icon from './Icon'
import { holidayIconName } from '../lib/iconMap'
import { diffParts, formatShortDate, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thẻ compact chỉ hiển thị số ngày nên chỉ cần cập nhật mỗi phút; thẻ đầy đủ có đồng hồ giây.
 * Cả hai dùng chung bộ đếm (useNow) nên toàn app chỉ có 1 timer cho mỗi chu kỳ.
 */
function CountdownCard({ holiday, nextDate, compact = false, index = 0, onSelect }) {
  const now = useNow(compact ? 60000 : 1000)
  const { t, lang } = useTranslation()
  const iconName = holidayIconName(holiday.icon)
  const { days, hours, minutes, seconds } = diffParts(nextDate, now)
  const isTodayEvent = days === 0

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(holiday, nextDate)}
        style={{ '--i': index }}
        className="state focus-ring stagger-item flex w-44 shrink-0 snap-start flex-col gap-3 rounded-xl border border-outline-variant bg-card shadow-soft p-4 text-left lg:w-auto"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Icon name={iconName} size={20} />
        </div>
        <p className="line-clamp-2 min-h-[2.5rem] text-title-sm leading-5 text-ink">{holiday.name}</p>
        <div>
          <p className="text-headline-sm text-primary">{isTodayEvent ? t('common.today') : t('countdown.daysShort', days)}</p>
          <p className="text-body-sm text-ink-soft">{formatShortDate(nextDate)}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect?.(holiday, nextDate)}
      style={{ '--i': index }}
      className="state focus-ring stagger-item h-full w-full rounded-2xl border border-outline-variant bg-card shadow-soft p-5 text-left"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Icon name={iconName} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-title-md leading-snug text-ink">{holiday.name}</p>
          <p className="mt-0.5 text-body-md text-ink-soft">{formatVNDate(nextDate, lang)}</p>
        </div>
      </div>

      <CategoryBadge category={holiday.category} className="mt-4" />

      <div className="mt-4">
        {isTodayEvent ? (
          <div className="rounded-xl bg-primary py-3 text-center text-title-md text-on-primary">{t('countdown.occursToday')}</div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <TimeBox value={days} label={t('common.day')} />
            <TimeBox value={hours} label={t('common.hour')} />
            <TimeBox value={minutes} label={t('common.minute')} />
            <TimeBox value={seconds} label={t('common.second')} />
          </div>
        )}
      </div>

      <p className="mt-4 text-body-md text-ink-soft">{holiday.desc}</p>
    </button>
  )
}

function TimeBox({ value, label }) {
  return (
    <div className="rounded-lg bg-primary-container py-2 text-center">
      <p className="num text-title-lg text-on-primary-container">{String(value).padStart(2, '0')}</p>
      <p className="text-label-sm text-on-primary-container/80">{label}</p>
    </div>
  )
}

export default memo(CountdownCard)
