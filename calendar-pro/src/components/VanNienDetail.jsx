import Icon from './Icon'
import RollingNumber from './RollingNumber'
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
      {/* Hero Expressive: khối màu chủ đạo rực rỡ + hình cookie/flower xoay chậm làm nền; ngày âm là số cuộn khổng lồ */}
      <div className="fx-shine relative overflow-hidden rounded-[32px] bg-primary p-5 text-on-primary min-[360px]:p-6">
        <span className="fx-spin-slow shape-cookie pointer-events-none absolute -right-14 -top-14 h-52 w-52 bg-primary-container opacity-25" aria-hidden="true" />
        <span className="fx-spin-slower shape-flower pointer-events-none absolute -bottom-16 -right-6 h-40 w-40 bg-tertiary-container opacity-20" aria-hidden="true" />

        <div className="relative">
          <p className="text-label-lg opacity-85">{t('vanNienDetail.solar')}</p>
          <p className="mt-0.5 text-title-lg">{formatVNDate(date, lang)}</p>

          <p className="mt-6 text-label-lg opacity-85">{t('vanNienDetail.lunar')}</p>
          <div className="mt-1 flex items-end gap-4">
            <RollingNumber value={lunarDay} className="text-[clamp(4.5rem,20vw,6.5rem)] font-extrabold leading-none tracking-tighter" />
            <div className="pb-2">
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
      </div>

      {/* Ngày chay */}
      {isChay && (
        <div className="animate-rise flex items-center gap-4 rounded-3xl bg-chay-container p-4 text-on-chay-container">
          <div className="shape-scallop flex h-12 w-12 shrink-0 items-center justify-center bg-chay text-on-chay">
            <Icon name="eco" size={24} filled />
          </div>
          <div>
            <p className="text-title-sm">{isMungMot ? t('vanNienDetail.vegetarianFirstDay') : t('vanNienDetail.vegetarianFullMoon')}</p>
            <p className="text-body-md opacity-85">{t('vanNienDetail.vegetarianDesc')}</p>
          </div>
        </div>
      )}

      {/* Ngày lễ */}
      {holidaysToday.map((h) => (
        <div key={h.id} className="animate-rise flex items-start gap-4 rounded-3xl bg-holiday-container p-4 text-on-holiday-container">
          <div className="shape-cookie flex h-12 w-12 shrink-0 items-center justify-center bg-holiday text-on-holiday">
            <Icon name={holidayIconName(h.icon)} size={24} filled />
          </div>
          <div className="min-w-0">
            <p className="text-title-sm">{h.name}</p>
            <CategoryBadge category={h.category} className="mt-1" />
            <p className="mt-1.5 text-body-md opacity-85">{h.desc}</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3">
        <InfoTile icon="wb_sunny" label={t('vanNienDetail.dayCanChi')} value={canChiN} />
        <InfoTile icon="auto_awesome" label={t('vanNienDetail.monthCanChi')} value={canChiT} />
        <InfoTile icon="cruelty_free" label={t('vanNienDetail.yearAnimal')} value={convat} />
      </div>

      <div className="rounded-3xl bg-surface-container p-4">
        <div className="mb-3 flex items-center gap-2 text-on-surface-variant">
          <Icon name="schedule" size={22} />
          <p className="text-title-sm">{t('vanNienDetail.luckyHours')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {gioTot.map((g) => (
            <span key={g} className="flex h-8 items-center rounded-full bg-tertiary-container px-3.5 text-label-lg text-on-tertiary-container">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Nhãn viên thuốc trên nền màu chủ đạo (ngày mùng một, rằm, chay) */
function Chip({ children, icon }) {
  return (
    <span className="flex h-8 items-center gap-1.5 rounded-full bg-on-primary/20 px-3.5 text-label-lg backdrop-blur-sm">
      {icon && <Icon name={icon} size={16} filled />}
      {children}
    </span>
  )
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-surface-container p-3 min-[360px]:p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
        <Icon name={icon} size={20} filled />
      </span>
      <div>
        <p className="text-label-sm leading-tight text-on-surface-variant">{label}</p>
        <p className="mt-0.5 text-title-sm text-on-surface">{value}</p>
      </div>
    </div>
  )
}
