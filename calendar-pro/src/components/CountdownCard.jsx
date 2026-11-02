import { memo } from 'react'
import Icon from './Icon'
import RollingNumber from './RollingNumber'
import WavyProgress from './WavyProgress'
import HolidayArt from './HolidayArt'
import { holidayIconName } from '../lib/iconMap'
import { getHolidayTheme } from '../data/holidayThemes'
import { diffParts, formatShortDate, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thẻ compact chỉ hiển thị số ngày nên chỉ cần cập nhật mỗi phút; thẻ đầy đủ có đồng hồ giây.
 * Cả hai dùng chung bộ đếm (useNow) nên toàn app chỉ có 1 timer cho mỗi chu kỳ.
 * Hình icon luân phiên giữa các hình Expressive (cookie / scallop / flower / sunny) theo thứ tự thẻ.
 * Ngày đặc biệt (Giáng sinh, Halloween, Tết...) có nền gradient + trang trí riêng theo chủ đề (data/holidayThemes.js).
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
  const theme = getHolidayTheme(holiday.id)

  // Thẻ thường: bề mặt tonal theo màu chủ đạo. Thẻ chủ đề: nền gradient riêng, chữ trắng.
  const surface = theme ? 'text-white' : 'bg-surface-container text-on-surface'
  const surfaceStyle = theme ? { '--i': index, background: theme.bg, boxShadow: `0 10px 26px -12px ${theme.glow}` } : { '--i': index }
  const iconTone = theme ? 'bg-white/20 text-white' : 'bg-primary-container text-on-primary-container'
  const subText = theme ? 'text-white/80' : 'text-on-surface-variant'

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(holiday, nextDate)}
        style={surfaceStyle}
        className={`state morph-square lift focus-ring stagger-item fx-spot flex w-48 shrink-0 snap-start flex-col gap-3 rounded-[28px] p-4 text-left lg:w-auto ${surface}`}
      >
        {theme && <HolidayArt theme={theme} compact />}
        <div className={`${shape} relative flex h-12 w-12 items-center justify-center ${iconTone}`}>
          <Icon name={iconName} size={24} filled />
        </div>
        <p className={`relative line-clamp-2 min-h-[2.5rem] text-title-sm leading-5 ${theme ? 'text-white' : 'text-on-surface'}`}>{holiday.name}</p>
        <div className="relative">
          <p className={`text-headline-sm ${theme ? 'text-white' : 'text-primary'}`}>{isTodayEvent ? t('common.today') : t('countdown.daysShort', days)}</p>
          <p className={`text-body-sm ${subText}`}>{formatShortDate(nextDate)}</p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect?.(holiday, nextDate)}
      style={surfaceStyle}
      className={`state morph-square lift focus-ring stagger-item fx-spot reveal h-full w-full rounded-[32px] p-5 text-left ${surface}`}
    >
      {theme && <HolidayArt theme={theme} />}
      <div className="relative flex items-start gap-4">
        <div className={`${shape} flex h-14 w-14 shrink-0 items-center justify-center ${iconTone}`}>
          <Icon name={iconName} size={28} filled />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-title-md leading-snug ${theme ? 'text-white' : 'text-on-surface'}`}>{holiday.name}</p>
          <p className={`mt-0.5 text-body-md ${subText}`}>{formatVNDate(nextDate, lang)}</p>
        </div>
      </div>

      <CategoryBadge category={holiday.category} className={`relative mt-4 ${theme ? '!bg-white/20 !text-white' : ''}`} />

      <div className="relative mt-4">
        {isTodayEvent ? (
          <div className={`rounded-3xl py-3 text-center text-title-md ${theme ? 'bg-white' : 'bg-primary text-on-primary'}`} style={theme ? { color: theme.strong } : undefined}>
            {t('countdown.occursToday')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              <TimeBox value={days} label={t('common.day')} strong theme={theme} />
              <TimeBox value={hours} label={t('common.hour')} theme={theme} />
              <TimeBox value={minutes} label={t('common.minute')} theme={theme} />
              <TimeBox value={seconds} label={t('common.second')} theme={theme} />
            </div>
            <WavyProgress value={progress} className="mt-4 px-0.5" color={theme ? '#ffffff' : undefined} />
          </>
        )}
      </div>

      <p className={`relative mt-4 text-body-md ${subText}`}>{holiday.desc}</p>
    </button>
  )
}

function TimeBox({ value, label, strong = false, theme }) {
  if (theme) {
    return (
      <div className={`rounded-2xl py-2 text-center ${strong ? 'bg-white' : 'bg-white/20 text-white backdrop-blur-[2px]'}`} style={strong ? { color: theme.strong } : undefined}>
        <RollingNumber value={value} pad={2} className="text-title-lg font-bold" />
        <p className="text-label-sm opacity-80">{label}</p>
      </div>
    )
  }
  return (
    <div className={`rounded-2xl py-2 text-center ${strong ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'}`}>
      <RollingNumber value={value} pad={2} className="text-title-lg font-bold" />
      <p className="text-label-sm opacity-80">{label}</p>
    </div>
  )
}

export default memo(CountdownCard)
