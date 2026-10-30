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

const DayCell = memo(function DayCell({ cell, selected, isToday, lunarWord, onSelect }) {
  let tone = 'text-ink'
  if (selected) tone = 'bg-primary text-on-primary'
  else if (isToday) tone = 'border border-primary text-primary font-semibold'
  else if (cell.isSunday) tone = 'text-error'

  return (
    <button
      onClick={() => onSelect(cell.date)}
      className={`state focus-ring mx-auto flex aspect-square w-full max-w-[3.75rem] flex-col lg:max-w-[4.25rem] items-center justify-center rounded-full transition-colors duration-150 ${tone} ${
        cell.inMonth ? '' : 'opacity-40'
      }`}
      aria-label={`${cell.label}, ${lunarWord} ${cell.lunarAria}`}
      aria-pressed={selected}
      aria-current={isToday ? 'date' : undefined}
    >
      <span className="num text-body-lg leading-[1.125rem] sm:leading-5">{cell.day}</span>
      <span
        className={`num text-label-sm leading-[0.875rem] sm:leading-4 ${
          selected ? 'opacity-80' : cell.isLunarMark ? 'font-semibold text-ink' : isToday || cell.isSunday ? 'opacity-70' : 'text-ink-soft'
        }`}
      >
        {cell.lunarLabel}
      </span>
      {(cell.isHoliday || cell.isChay) && (
        <span className="absolute right-[12%] top-[12%] flex flex-col gap-0.5" aria-hidden="true">
          {cell.isHoliday && <span className="h-1 w-1 rounded-full bg-amber-500" />}
          {cell.isChay && <span className="h-1 w-1 rounded-full bg-emerald-500" />}
        </span>
      )}
    </button>
  )
})

/** Lưới lịch tối giản: ngày đang chọn tô màu nhấn, hôm nay viền màu nhấn, ngày chủ nhật chữ đỏ. */
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
      <div className="grid grid-cols-7 pb-2 text-center text-label-sm text-ink-faint">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`py-2 ${i === 6 ? 'text-error' : ''}`}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell) => (
          <DayCell
            key={cell.key}
            cell={cell}
            selected={cell.key === selectedKey}
            isToday={cell.key === todayKey}
            lunarWord={lunarWord}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
