import Icon from './Icon'
import RollingNumber from './RollingNumber'
import WavyProgress from './WavyProgress'
import HolidayArt from './HolidayArt'
import { holidayIconName } from '../lib/iconMap'
import { getHolidayTheme } from '../data/holidayThemes'
import { getHolidayDetail } from '../data/holidayDetails'
import Button from './Button'
import { localizedHoliday } from '../data/holidayI18n'
import { anniversaryNumber, diffParts, formatVNDate } from '../lib/dateUtils'
import { buildIcs, downloadText } from '../lib/ics'
import { renderShareCard, shareOrDownload } from '../lib/shareImage'
import { useToast } from '../contexts/ToastContext'
import { useState } from 'react'
import CategoryBadge from './CategoryBadge'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Nội dung chi tiết ngày lễ (hiện trong sheet toàn màn hình): banner (có chủ đề riêng cho ngày đặc biệt),
 * đồng hồ đếm ngược, thông tin lịch, ý nghĩa chi tiết, phong tục / hoạt động và điều thú vị.
 */
export default function HolidayDetail({ holiday, nextDate, onEdit, onDelete }) {
  const now = useNow(1000)
  const { t, lang } = useTranslation()
  const { notify } = useToast()
  const [sharing, setSharing] = useState(false)
  const { name, desc } = localizedHoliday(holiday, lang)
  const nth = holiday.personal ? anniversaryNumber(holiday, nextDate) : 0
  const iconName = holidayIconName(holiday.icon)
  const { days, hours, minutes, seconds } = diffParts(nextDate, now)
  const isTodayEvent = days === 0
  const progress = 1 - Math.min(days, 365) / 365
  const theme = getHolidayTheme(holiday.id)
  const detail = getHolidayDetail(holiday, lang)
  // Biểu tượng đầu mỗi mục: nền theo màu chủ đề của ngày lễ (nếu có)
  const badgeStyle = theme ? { background: theme.bg } : undefined
  const badgeClass = theme ? 'text-white' : 'bg-primary-container text-on-primary-container'

  function addToCalendar() {
    const item = { id: holiday.id, name, description: desc || undefined, type: holiday.type, day: holiday.day, month: holiday.month, isEve: holiday.isEve }
    downloadText(`${holiday.id}.ics`, buildIcs([item]))
    notify(t('holidayDetail.icsDone'), { type: 'success' })
  }

  async function shareImage() {
    setSharing(true)
    try {
      const css = getComputedStyle(document.documentElement)
      const blob = await renderShareCard({
        name,
        dateText: formatVNDate(nextDate, lang),
        daysText: isTodayEvent ? t('holidayDetail.shareToday') : String(days),
        unitText: isTodayEvent ? '' : t('holidayDetail.shareUnit'),
        footer: 'calendar-pro-rouge.vercel.app',
        theme,
        fallbackColors: [css.getPropertyValue('--primary').trim() || '#BE003A', css.getPropertyValue('--tertiary').trim() || '#7a0027']
      })
      const result = await shareOrDownload(blob, `${holiday.id}.png`, name)
      if (result === 'downloaded') notify(t('holidayDetail.imageSaved'), { type: 'success' })
    } catch {
      notify(t('holidayDetail.imageFailed'), { type: 'error' })
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Banner */}
      <div
        className={`holiday-live holiday-text fx-shine relative isolate overflow-hidden rounded-[32px] p-6 sm:p-8 ${theme ? 'text-white' : 'bg-primary text-on-primary'}`}
        style={theme ? { background: theme.bg, boxShadow: `0 14px 30px -16px ${theme.glow}` } : undefined}
      >
        {theme ? (
          <HolidayArt theme={theme} scale={1.35} />
        ) : (
          <span className="fx-spin-slow shape-sunny pointer-events-none absolute -right-12 -top-12 h-44 w-44 bg-primary-container opacity-25" aria-hidden="true" />
        )}
        <div className="relative">
          <div className={`shape-cookie flex h-16 w-16 items-center justify-center ${theme ? 'bg-white/20 text-white' : 'bg-primary-container text-on-primary-container'}`}>
            <Icon name={iconName} size={32} filled />
          </div>
          <h3 className="mt-5 text-headline-md sm:text-display-md">{name}</h3>
          <p className="mt-1.5 text-body-lg opacity-90">{formatVNDate(nextDate, lang)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2" style={{ textShadow: 'none' }}>
            <CategoryBadge category={holiday.category} className="!bg-surface-lowest !text-on-surface" />
            {nth > 0 && <span className="inline-flex items-center rounded-full bg-tertiary-container px-2.5 py-1 text-label-sm text-on-tertiary-container">{t('holidayDetail.anniversary', nth)}</span>}
          </div>
        </div>
      </div>

      {/* Đếm ngược */}
      {isTodayEvent ? (
        <div className="rounded-3xl bg-primary py-5 text-center text-title-lg text-on-primary">{t('countdown.occursToday')}</div>
      ) : (
        <div className="rounded-[28px] bg-surface-container p-3">
          <p className="px-2 pb-2 text-label-md uppercase text-on-surface-variant">{t('holidayDetail.daysLeft')}</p>
          <div className="grid grid-cols-4 gap-2">
            <TimeBox value={days} label={t('common.day')} strong />
            <TimeBox value={hours} label={t('common.hour')} />
            <TimeBox value={minutes} label={t('common.minute')} />
            <TimeBox value={seconds} label={t('common.second')} />
          </div>
          <WavyProgress value={progress} className="mt-4 px-1" />
        </div>
      )}

      {/* Thông tin lịch */}
      <div className="overflow-hidden rounded-3xl bg-surface-container">
        <ListItem icon="event" overline={t('holidayDetail.lastOccurrence')} text={formatVNDate(nextDate, lang)} />
        <div className="mx-4 h-px bg-outline-variant" />
        <ListItem
          icon="sell"
          overline={t('holidayDetail.calendarType')}
          text={`${holiday.type === 'solar' ? t('holidayDetail.bySolar') : t('holidayDetail.byLunar')} — ${holiday.day}/${holiday.month}`}
        />
      </div>

      {/* Hành động: thêm vào lịch / chia sẻ ảnh (+ sửa, xoá với sự kiện cá nhân) */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" icon={(p) => <Icon name="event" {...p} />} onClick={addToCalendar}>
          {t('holidayDetail.addToCalendar')}
        </Button>
        <Button variant="secondary" icon={(p) => <Icon name="share" {...p} />} loading={sharing} onClick={shareImage}>
          {t('holidayDetail.shareImage')}
        </Button>
        {onEdit && (
          <Button variant="outline" icon={(p) => <Icon name="edit" {...p} />} onClick={onEdit}>
            {t('holidayDetail.edit')}
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" icon={(p) => <Icon name="delete" {...p} />} onClick={onDelete} className="!text-error">
            {t('holidayDetail.remove')}
          </Button>
        )}
      </div>
      {holiday.personal && <p className="px-2 text-body-sm text-on-surface-variant">{t('holidayDetail.personalNote')} {t('holidayDetail.repeatsYearly')}.</p>}

      {/* Ý nghĩa */}
      {detail.meaning.length > 0 && <Section icon="auto_stories" title={t('holidayDetail.meaning')} badgeClass={badgeClass} badgeStyle={badgeStyle}>
        <div className="flex flex-col gap-3">
          {detail.meaning.map((p, i) => (
            <p key={i} className="text-body-lg leading-7 text-on-surface-variant">
              {p}
            </p>
          ))}
        </div>
      </Section>}

      {/* Phong tục & hoạt động */}
      {detail.customs.length > 0 && (
        <Section icon="celebration" title={t('holidayDetail.customs')} badgeClass={badgeClass} badgeStyle={badgeStyle}>
          <ul className="flex flex-col gap-3">
            {detail.customs.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-body-lg leading-7 text-on-surface-variant">
                <Icon name="check_circle" size={22} filled className="mt-[3px] text-primary" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Điều thú vị */}
      {detail.fact && (
        <div className="flex items-start gap-3 rounded-3xl bg-tertiary-container p-4 text-on-tertiary-container">
          <Icon name="auto_awesome" size={24} filled className="mt-0.5" />
          <div>
            <p className="text-title-sm">{t('holidayDetail.fact')}</p>
            <p className="mt-1 text-body-lg leading-7">{detail.fact}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, badgeClass, badgeStyle, children }) {
  return (
    <section className="rounded-3xl bg-surface-container p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className={`shape-scallop flex h-10 w-10 shrink-0 items-center justify-center ${badgeClass}`} style={badgeStyle}>
          <Icon name={icon} size={22} filled />
        </span>
        <h4 className="text-title-lg text-on-surface">{title}</h4>
      </div>
      {children}
    </section>
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
