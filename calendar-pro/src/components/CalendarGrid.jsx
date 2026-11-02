import { memo, useMemo } from 'react'
import { getLunarInfo, mondayIndex, pad2, weekdaysShort } from '../lib/dateUtils'
import { NGAY_CHAY_NHI_TRAI, getHolidaysOnDate } from '../data/holidays'
import { useNow } from '../hooks/useNow'
import { useTranslation } from '../i18n/useTranslation'

const dateKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/** Dữ liệu 42 ô của tháng — tính 1 lần cho mỗi tháng (âm lịch + ngày lễ), không tính lại khi chọn ngày. */
function buildCells(year, month) {
  const start = new Date(year, month, 1 - mondayIndex(new Date(year, month, 1).getDay()))
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const lunar = getLunarInfo(date)
    const holidays = getHolidaysOnDate(date, lunar)
    return {
      date,
      key: dateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isSunday: date.getDay() === 0,
      isHoliday: holidays.length > 0,
      holidayNames: holidays.map((h) => h.name).join(', '),
      isChay: NGAY_CHAY_NHI_TRAI.includes(lunar.lunarDay),
      isLunarMark: lunar.lunarDay === 15 || lunar.lunarDay === 1,
      lunarLabel: lunar.lunarDay === 1 ? `${lunar.lunarDay}/${pad2(lunar.lunarMonth)}` : pad2(lunar.lunarDay),
      label: `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`,
      lunarAria: `${lunar.lunarDay}/${lunar.lunarMonth}`
    }
  })
}

/** Nền tô cả ô cho ngày lễ / ngày chay; cả hai cùng lúc thì chia chéo 2 màu. */
const TINT_BOTH = 'linear-gradient(135deg, var(--holiday-container) 50%, var(--chay-container) 50%)'

const DayCell = memo(function DayCell({ cell, selected, isToday, lunarWord, chayWord, wave, onSelect }) {
  const tinted = !selected && (cell.isHoliday || cell.isChay)
  let tone = 'text-on-surface'
  if (selected) tone = 'text-on-primary'
  else if (tinted) tone = cell.isHoliday ? 'text-on-holiday-container' : 'text-on-chay-container'
  else if (isToday) tone = 'text-primary font-bold'
  else if (cell.isSunday) tone = 'text-error'
  // Hôm nay: viền vòng; ngày lễ/chay + hôm nay: viền theo màu chữ của ô để vẫn nhận ra
  const ring = isToday && !selected ? (tinted ? ' font-bold shadow-[inset_0_0_0_2px_currentColor]' : ' shadow-[inset_0_0_0_2px_var(--primary)]') : ''
  const tint = tinted ? (cell.isHoliday && cell.isChay ? { background: TINT_BOTH } : undefined) : undefined
  const tintClass = tinted && !tint ? (cell.isHoliday ? 'bg-holiday-container' : 'bg-chay-container') : ''

  return (
    <button
      onClick={() => onSelect(cell.date)}
      style={{ '--wave': wave, ...tint }}
      className={`state day-wave focus-ring relative mx-auto flex aspect-square w-full max-w-[3.75rem] flex-col items-center justify-center rounded-full transition-[box-shadow,color] duration-effects ease-effects active:scale-90 lg:max-w-[4.5rem] ${tone}${ring} ${tintClass} ${
        cell.inMonth ? '' : 'opacity-40'
      }`}
      aria-label={`${cell.label}, ${lunarWord} ${cell.lunarAria}${cell.isHoliday ? `, ${cell.holidayNames}` : ''}${cell.isChay ? `, ${chayWord}` : ''}`}
      aria-pressed={selected}
      aria-current={isToday ? 'date' : undefined}
    >
      {/* Ngày đang chọn: hình "cookie" 9 cánh nảy ra bằng spring */}
      {selected && <span className="day-selected-shape shape-cookie absolute inset-[-3%] bg-primary" aria-hidden="true" />}
      <span className="num relative text-title-md leading-[1.125rem] sm:leading-5">{cell.day}</span>
      <span
        className={`num relative text-label-sm leading-[0.875rem] sm:leading-4 ${
          selected ? 'opacity-85' : tinted ? (cell.isLunarMark ? 'font-bold opacity-90' : 'opacity-75') : cell.isLunarMark ? 'font-bold text-on-surface' : isToday || cell.isSunday ? 'opacity-75' : 'text-on-surface-variant'
        }`}
      >
        {cell.lunarLabel}
      </span>
      {/* Ô đang chọn bị cookie màu chủ đạo che nền → giữ lại chấm nhỏ để vẫn biết đó là ngày lễ / chay */}
      {selected && (cell.isHoliday || cell.isChay) && (
        <span className="absolute right-[14%] top-[14%] flex flex-col gap-0.5" aria-hidden="true">
          {cell.isHoliday && <span className="h-1.5 w-1.5 rounded-full bg-on-primary" />}
          {cell.isChay && <span className="h-1.5 w-1.5 rounded-full bg-on-primary/70" />}
        </span>
      )}
    </button>
  )
})

/** Lưới lịch Expressive: ngày chọn = hình cookie màu chủ đạo, hôm nay = vòng viền, chủ nhật chữ đỏ; đổi tháng thì các ô nảy ra theo làn sóng chéo. */
export default function CalendarGrid({ year, month, selectedDate, onSelect }) {
  const { t, lang } = useTranslation()
  const WEEKDAYS = weekdaysShort(lang)
  const now = useNow(60000) // cập nhật "hôm nay" khi qua nửa đêm mà không cần tải lại
  const todayKey = dateKey(now)
  const selectedKey = selectedDate ? dateKey(selectedDate) : null
  const cells = useMemo(() => buildCells(year, month), [year, month])
  const lunarWord = t('vanNienDetail.lunar')
  const chayWord = t('calendar.legendVegetarian')

  return (
    <div>
      <div className="grid grid-cols-7 pb-2 text-center text-label-md text-on-surface-variant">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`py-2 ${i === 6 ? 'text-error' : ''}`}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => (
          <DayCell
            key={cell.key}
            cell={cell}
            selected={cell.key === selectedKey}
            isToday={cell.key === todayKey}
            lunarWord={lunarWord}
            chayWord={chayWord}
            wave={Math.floor(i / 7) + (i % 7)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
