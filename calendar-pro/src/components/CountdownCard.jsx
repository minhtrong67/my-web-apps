import { memo } from 'react'
import Icon from './Icon'
import RollingNumber from './RollingNumber'
import WavyProgress from './WavyProgress'
import { holidayIconName } from '../lib/iconMap'
import { diffParts, formatShortDate, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thẻ compact chỉ hiển thị số ngày nên chỉ cần cập nhật mỗi phút; thẻ đầy đủ có đồng hồ giây.
 * Cả hai dùng chung bộ đếm (useNow) nên toàn app chỉ có 1 timer cho mỗi chu kỳ.
 * Hình icon luân phiên giữa các hình Expressive (cookie / scallop / flower / sunny) theo thứ tự thẻ.
 */
const ICON_SHAPES = ['shape-cookie', 'shape-scallop', 'shape-flower', 'shape-sunny', 'shape-burst']

function CountdownCard({ holiday, nextDate, compact = false, index = 0, onSelect }) {
  const now = useNow(compact ? 60000 : 1000)
  const { t, lang } = useTranslation()
  const iconName = holidayIconName(holiday.icon)
  const { days, hours, minutes, seconds } = diffParts(nextDate, now)
  const isTodayEvent = days === 0
  const shape = ICON_SHAPES[index % ICON_SHAPES.length]
  const progress = 1 - Math.min(days, 365) / 365

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(holiday, nextDate)}
        style={{ '--i': index }}
        className="state morph-square lift focus-ring stagger-item fx-spot flex w-48 shrink-0 snap-start flex-col gap-3 rounded-[28px] bg-surface-container p-4 text-left lg:w-auto"
      >
        <div className={`${shape} flex h-12 w-12 items-center justify-center bg-primary-container text-on-primary-container`}>
          <Icon name={iconName} size={24} filled />
        </div>
        <p className="line-clamp-2 min-h-[2.5rem] text-title-sm leading-5 text-on-surface">{holiday.name}</p>
        <div>
          <p className="text-headline-sm text-primary">{isTodayEvent ? t('common.today') : t('countdown.daysShort', days)}</p>
          <p className="text-body-sm text-on-surface-variant">{formatShortDate(nextDate)}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect?.(holiday, nextDate)}
      style={{ '--i': index }}
      className="state morph-square lift focus-ring stagger-item fx-spot reveal h-full w-full rounded-[32px] bg-surface-container p-5 text-left"
    >
      <div className="flex items-start gap-4">
        <div className={`${shape} flex h-14 w-14 shrink-0 items-center justify-center bg-primary-container text-on-primary-container`}>
          <Icon name={iconName} size={28} filled />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-title-md leading-snug text-on-surface">{holiday.name}</p>
          <p className="mt-0.5 text-body-md text-on-surface-variant">{formatVNDate(nextDate, lang)}</p>
        </div>
      </div>

      <CategoryBadge category={holiday.category} className="mt-4" />

      <div className="mt-4">
        {isTodayEvent ? (
          <div className="rounded-3xl bg-primary py-3 text-center text-title-md text-on-primary">{t('countdown.occursToday')}</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              <TimeBox value={days} label={t('common.day')} strong />
              <TimeBox value={hours} label={t('common.hour')} />
              <TimeBox value={minutes} label={t('common.minute')} />
              <TimeBox value={seconds} label={t('common.second')} />
            </div>
            <WavyProgress value={progress} className="mt-4 px-0.5" />
          </>
        )}
      </div>

      <p className="mt-4 text-body-md text-on-surface-variant">{holiday.desc}</p>
    </button>
  )
}

function TimeBox({ value, label, strong = false }) {
  return (
    <div className={`rounded-2xl py-2 text-center ${strong ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'}`}>
      <RollingNumber value={value} pad={2} className="text-title-lg font-bold" />
      <p className="text-label-sm opacity-80">{label}</p>
    </div>
  )
}

export default memo(CountdownCard)
