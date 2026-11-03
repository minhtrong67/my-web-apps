import { useMemo, useState } from 'react'
import Icon from './Icon'
import Button from './Button'
import SelectField from './SelectField'
import { holidayIconName } from '../lib/iconMap'
import { EVENT_ICONS, maxDayOf, saveEvent } from '../lib/personalEvents'
import { useToast } from '../contexts/ToastContext'
import { useTranslation } from '../i18n/useTranslation'

/** Ô nhập văn bản kiểu "filled" của Material 3 — cùng phong cách với SelectField */
function TextField({ label, error, hint, className = '', ...props }) {
  return (
    <label className={`group relative block min-w-0 ${className}`}>
      <span className="pointer-events-none absolute left-4 top-2 z-10 text-label-sm text-on-surface-variant transition-colors group-focus-within:text-primary">{label}</span>
      <input
        className={`h-14 w-full min-w-0 rounded-2xl bg-surface-high pb-1 pl-4 pr-4 pt-5 text-body-lg font-medium text-on-surface outline-none transition-[background-color,box-shadow] duration-effects ease-effects placeholder:font-normal placeholder:text-on-surface-variant/60 hover:bg-surface-highest focus:bg-surface-highest focus:shadow-[inset_0_-2px_0_var(--primary)] ${error ? 'shadow-[inset_0_-2px_0_var(--error)]' : ''}`}
        {...props}
      />
      {(error || hint) && <span className={`mt-1.5 block px-4 text-body-sm ${error ? 'text-error' : 'text-on-surface-variant'}`}>{error || hint}</span>}
    </label>
  )
}

/**
 * Form thêm / sửa sự kiện cá nhân (đặt trong Sheet; mỗi lần mở là một lần mount mới nên state tự đặt lại).
 * initial: sự kiện đang sửa (hoặc undefined khi thêm mới).
 */
export default function EventForm({ initial, onDone, onCancel }) {
  const { t } = useTranslation()
  const { notify } = useToast()
  const now = new Date()
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'solar')
  const [day, setDay] = useState(initial?.day ?? now.getDate())
  const [month, setMonth] = useState(initial?.month ?? now.getMonth() + 1)
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '')
  const [icon, setIcon] = useState(initial?.icon ?? EVENT_ICONS[0])
  const [error, setError] = useState('')

  const maxDay = maxDayOf(type, month)
  const safeDay = Math.min(day, maxDay)
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay])

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('events.nameRequired'))
      return
    }
    const y = year.trim() === '' ? undefined : Number.parseInt(year, 10)
    const ok = saveEvent({ id: initial?.id, name, type, day: safeDay, month, year: y, icon })
    if (!ok) {
      notify(t('events.limit'), { type: 'warning' })
      return
    }
    notify(t('events.saved'), { type: 'success' })
    onDone?.()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pb-2" noValidate>
      <TextField
        label={t('events.name')}
        value={name}
        maxLength={60}
        autoFocus
        placeholder={t('events.namePlaceholder')}
        error={error}
        onChange={(e) => {
          setName(e.target.value)
          if (error) setError('')
        }}
      />

      <div>
        <p className="mb-2 px-1 text-label-md text-on-surface-variant">{t('events.calendarType')}</p>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-high p-1" role="radiogroup" aria-label={t('events.calendarType')}>
          {['solar', 'lunar'].map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={type === id}
              onClick={() => setType(id)}
              className={`state focus-ring h-11 rounded-full text-label-lg transition-[background-color,color] duration-effects ease-effects ${type === id ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
            >
              {t(`events.${id}`)}
            </button>
          ))}
        </div>
        {type === 'lunar' && <p className="mt-2 px-1 text-body-sm text-on-surface-variant">{t('events.lunarNote')}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField label={t('events.day')} value={safeDay} onChange={(e) => setDay(Number(e.target.value))}>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectField>
        <SelectField label={t('events.month')} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </SelectField>
      </div>

      <TextField
        label={t('events.year')}
        value={year}
        inputMode="numeric"
        placeholder="1990"
        hint={t('events.yearHint')}
        onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
      />

      <div>
        <p className="mb-2 px-1 text-label-md text-on-surface-variant">{t('events.icon')}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('events.icon')}>
          {EVENT_ICONS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={icon === key}
              onClick={() => setIcon(key)}
              aria-label={holidayIconName(key)}
              className={`state morph focus-ring flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-effects ease-effects ${icon === key ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant'}`}
            >
              <Icon name={holidayIconName(key)} size={24} filled={icon === key} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" className="flex-1" icon={(p) => <Icon name="check" {...p} />}>{t('events.save')}</Button>
      </div>
    </form>
  )
}
