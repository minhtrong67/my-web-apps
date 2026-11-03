import { memo } from 'react'
import Icon from './Icon'
import RollingNumber from './RollingNumber'
import WavyProgress from './WavyProgress'
import HolidayArt from './HolidayArt'
import { holidayIconName } from '../lib/iconMap'
import { getHolidayTheme } from '../data/holidayThemes'
import { localizedHoliday } from '../data/holidayI18n'
import { anniversaryNumber, diffParts, formatShortDate, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thẻ compact chỉ hiển thị số ngày nên chỉ cần cập nhật mỗi phút; thẻ đầy đủ có đồng hồ giây.
 * Cả hai dùng chung bộ đếm (useNow) nên toàn app chỉ có 1 timer cho mỗi chu kỳ.
 * Hình icon luân phiên giữa các hình Expressive (cookie / scallop / flower / sunny) theo thứ tự thẻ.
 * Ngày đặc biệt (Giáng sinh, Halloween, Tết...) có nền gradient + trang trí riêng theo chủ đề (data/holidayThemes.js).
 * Thẻ đầy đủ (trang Đếm ngược) KHÔNG bấm được cả thẻ — chỉ nút "Xem chi tiết" ở cuối mới mở sheet, tránh bấm nhầm khi lướt trang.
 * Thẻ compact (cuộn ngang ở Trang chủ) vẫn bấm cả thẻ.
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
  const { name, desc } = localizedHoliday(holiday, lang)
  const nth = holiday.personal ? anniversaryNumber(holiday, nextDate) : null

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
        className={`state morph-square lift focus-ring stagger-item fx-spot flex w-48 shrink-0 snap-start flex-col gap-3 rounded-[28px] p-4 text-left lg:w-auto ${surface} ${theme ? 'holiday-text' : ''}`}
      >
        {theme && <HolidayArt theme={theme} compact />}
        <div className={`${shape} relative flex h-12 w-12 items-center justify-center ${iconTone}`}>
          <Icon name={iconName} size={24} filled />
        </div>
        <p className={`relative line-clamp-2 min-h-[2.5rem] text-title-sm leading-5 ${theme ? 'text-white' : 'text-on-surface'}`}>{name}</p>
        <div className="relative">
          <p className={`text-headline-sm ${theme ? 'text-white' : 'text-primary'}`}>{isTodayEvent ? t('common.today') : t('countdown.daysShort', days)}</p>
          <p className={`text-body-sm ${subText}`}>{formatShortDate(nextDate)}</p>
        </div>
      </button>
    )
  }

  return (
    <article
      style={surfaceStyle}
      aria-label={name}
      className={`stagger-item fx-spot reveal relative flex h-full w-full flex-col overflow-hidden rounded-[32px] p-5 text-left ${surface} ${theme ? 'holiday-text' : ''}`}
    >
      {theme && <HolidayArt theme={theme} />}
      <div className="relative flex items-start gap-4">
        <div className={`${shape} flex h-14 w-14 shrink-0 items-center justify-center ${iconTone}`}>
          <Icon name={iconName} size={28} filled />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-title-md leading-snug ${theme ? 'text-white' : 'text-on-surface'}`}>{name}</p>
          <p className={`mt-0.5 text-body-md ${subText}`}>{formatVNDate(nextDate, lang)}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <CategoryBadge category={holiday.category} className={theme ? '!bg-white/20 !text-white' : ''} />
        {nth > 0 && (
          <span className="inline-flex items-center rounded-full bg-tertiary-container px-2.5 py-1 text-label-sm text-on-tertiary-container">{t('holidayDetail.anniversary', nth)}</span>
        )}
      </div>

      <div className="relative mt-4">
        {isTodayEvent ? (
          <div className={`rounded-3xl py-3 text-center text-title-md ${theme ? 'bg-white' : 'bg-primary text-on-primary'}`} style={theme ? { color: theme.strong, textShadow: 'none' } : undefined}>
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

      {desc && <p className={`relative mt-4 text-body-md ${subText}`}>{desc}</p>}

      {/* Nút xem chi tiết (toàn chiều rộng) — chỉ nút này mở sheet */}
      <div className="relative mt-auto pt-5">
        <button
          type="button"
          onClick={() => onSelect?.(holiday, nextDate)}
          aria-label={`${t('countdown.viewDetail')}: ${name}`}
          className={`state morph focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-full text-title-sm ${
            theme ? 'bg-white' : 'bg-secondary-container text-on-secondary-container'
          }`}
          style={theme ? { color: theme.strong, textShadow: 'none' } : undefined}
        >
          {t('countdown.viewDetail')}
          <Icon name="arrow_forward" size={20} weight={500} />
        </button>
      </div>
    </article>
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
