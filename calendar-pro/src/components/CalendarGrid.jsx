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
    return {
      date,
      key: dateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isSunday: date.getDay() === 0,
      isHoliday: getHolidaysOnDate(date, lunar).length > 0,
      isChay: NGAY_CHAY_NHI_TRAI.includes(lunar.lunarDay),
      isLunarMark: lunar.lunarDay === 15 || lunar.lunarDay === 1,
      lunarLabel: lunar.lunarDay === 1 ? `${lunar.lunarDay}/${pad2(lunar.lunarMonth)}` : pad2(lunar.lunarDay),
      label: `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`,
      lunarAria: `${lunar.lunarDay}/${lunar.lunarMonth}`
    }
  })
}

const DayCell = memo(function DayCell({ cell, selected, isToday, lunarWord, wave, onSelect }) {
  let tone = 'text-on-surface'
  if (selected) tone = 'text-on-primary'
  else if (isToday) tone = 'text-primary font-bold shadow-[inset_0_0_0_2px_var(--primary)]'
  else if (cell.isSunday) tone = 'text-error'

  return (
    <button
      onClick={() => onSelect(cell.date)}
      style={{ '--wave': wave }}
      className={`state day-wave focus-ring relative mx-auto flex aspect-square w-full max-w-[3.75rem] flex-col items-center justify-center rounded-full transition-[box-shadow,color] duration-effects ease-effects active:scale-90 lg:max-w-[4.5rem] ${tone} ${
        cell.inMonth ? '' : 'opacity-40'
      }`}
      aria-label={`${cell.label}, ${lunarWord} ${cell.lunarAria}`}
      aria-pressed={selected}
      aria-current={isToday ? 'date' : undefined}
    >
      {/* Ngày đang chọn: hình "cookie" 9 cánh nảy ra bằng spring */}
      {selected && <span className="day-selected-shape shape-cookie absolute inset-[-3%] bg-primary" aria-hidden="true" />}
      <span className="num relative text-title-md leading-[1.125rem] sm:leading-5">{cell.day}</span>
      <span
        className={`num relative text-label-sm leading-[0.875rem] sm:leading-4 ${
          selected ? 'opacity-85' : cell.isLunarMark ? 'font-bold text-on-surface' : isToday || cell.isSunday ? 'opacity-75' : 'text-on-surface-variant'
        }`}
      >
        {cell.lunarLabel}
      </span>
      {(cell.isHoliday || cell.isChay) && (
        <span className="absolute right-[14%] top-[14%] flex flex-col gap-0.5" aria-hidden="true">
          {cell.isHoliday && <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-on-primary' : 'bg-holiday'}`} />}
          {cell.isChay && <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-on-primary/70' : 'bg-chay'}`} />}
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
            wave={Math.floor(i / 7) + (i % 7)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
