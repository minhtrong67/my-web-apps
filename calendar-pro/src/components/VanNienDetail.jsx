import Icon from './Icon'
import { holidayIconName } from '../lib/iconMap'
import { canChiDay, canChiMonth, canChiYear, chiAnimalYear, gioHoangDao, lunarMonthName } from '../lib/lunar'
import { getLunarInfo, formatVNDate } from '../lib/dateUtils'
import CategoryBadge from './CategoryBadge'
import { NGAY_CHAY_NHI_TRAI, getHolidaysOnDate } from '../data/holidays'
import { useTranslation } from '../i18n/useTranslation'

export default function VanNienDetail({ date }) {
  const { t, lang } = useTranslation()
  const lunarInfo = getLunarInfo(date)
  const { lunarDay, lunarMonth, lunarYear, isLeap } = lunarInfo
  const canChiN = canChiDay(date.getDate(), date.getMonth() + 1, date.getFullYear())
  const canChiT = canChiMonth(lunarMonth, lunarYear)
  const canChiY = canChiYear(lunarYear)
  const convat = chiAnimalYear(lunarYear)
  const gioTot = gioHoangDao(date.getDate(), date.getMonth() + 1, date.getFullYear())
  const isChay = NGAY_CHAY_NHI_TRAI.includes(lunarDay)
  const isRam = lunarDay === 15
  const isMungMot = lunarDay === 1
  const holidaysToday = getHolidaysOnDate(date, lunarInfo)

  return (
    <div className="flex flex-col gap-3">
      {/* Hero: ngày âm là chữ số lớn duy nhất của trang — mọi thứ xung quanh giữ yên tĩnh */}
      <div className="rounded-2xl p-5 text-on-primary shadow-soft min-[360px]:p-6" style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #000))' }}>
        <p className="text-label-md opacity-90">{t('vanNienDetail.solar')}</p>
        <p className="mt-0.5 text-title-lg">{formatVNDate(date, lang)}</p>

        <div className="my-5 h-px bg-on-primary/25" />

        <p className="text-label-md opacity-90">{t('vanNienDetail.lunar')}</p>
        <div className="mt-1 flex items-end gap-4">
          <span className="num text-[clamp(4rem,19vw,5.5rem)] font-light leading-[0.95] tracking-tighter">{lunarDay}</span>
          <div className="pb-1.5">
            <p className="text-headline-sm">
              {isLeap ? t('vanNienDetail.leap') : ''}
              {t('vanNienDetail.monthOf', lunarMonthName(lunarMonth))}
            </p>
            <p className="text-body-md opacity-90">{t('vanNienDetail.yearOf', canChiY, lunarYear)}</p>
          </div>
        </div>

        {(isRam || isMungMot || isChay) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {isMungMot && <Chip>{t('vanNienDetail.firstDayBadge')}</Chip>}
            {isRam && <Chip>{t('vanNienDetail.fullMoonBadge')}</Chip>}
            {isChay && <Chip icon="eco">{t('vanNienDetail.vegetarianBadge')}</Chip>}
          </div>
        )}
      </div>

      {/* Ngày chay */}
      {isChay && (
        <div className="animate-fade-in flex items-center gap-4 rounded-xl border border-outline-variant bg-card shadow-soft p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-emerald-600 dark:text-emerald-400">
            <Icon name="eco" size={22} />
          </div>
          <div>
            <p className="text-title-sm text-ink">{isMungMot ? t('vanNienDetail.vegetarianFirstDay') : t('vanNienDetail.vegetarianFullMoon')}</p>
            <p className="text-body-md text-ink-soft">{t('vanNienDetail.vegetarianDesc')}</p>
          </div>
        </div>
      )}

      {/* Ngày lễ */}
      {holidaysToday.map((h) => (
        <div key={h.id} className="animate-fade-in flex items-start gap-4 rounded-xl border border-outline-variant bg-card shadow-soft p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-amber-600 dark:text-amber-400">
            <Icon name={holidayIconName(h.icon)} size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-title-sm text-ink">{h.name}</p>
            <CategoryBadge category={h.category} className="mt-1" />
            <p className="mt-1.5 text-body-md text-ink-soft">{h.desc}</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3">
        <InfoTile icon="wb_sunny" label={t('vanNienDetail.dayCanChi')} value={canChiN} />
        <InfoTile icon="auto_awesome" label={t('vanNienDetail.monthCanChi')} value={canChiT} />
        <InfoTile icon="cruelty_free" label={t('vanNienDetail.yearAnimal')} value={convat} />
      </div>

      <div className="rounded-xl border border-outline-variant bg-card shadow-soft p-4">
        <div className="mb-3 flex items-center gap-2 text-ink-soft">
          <Icon name="schedule" size={20} />
          <p className="text-title-sm">{t('vanNienDetail.luckyHours')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {gioTot.map((g) => (
            <span key={g} className="flex h-7 items-center rounded-md border border-outline-variant px-2.5 text-label-md text-ink-soft">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Nhãn nhỏ viền mảnh (ngày mùng một, rằm, chay) */
function Chip({ children, icon }) {
  return (
    <span className="flex h-7 items-center gap-1.5 rounded-md border border-on-primary/40 px-2.5 text-label-md">
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  )
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-card shadow-soft p-3 min-[360px]:p-3.5">
      <Icon name={icon} size={20} className="text-primary" />
      <div>
        <p className="text-label-sm leading-tight text-ink-soft">{label}</p>
        <p className="mt-0.5 text-title-sm text-ink">{value}</p>
      </div>
    </div>
  )
}
