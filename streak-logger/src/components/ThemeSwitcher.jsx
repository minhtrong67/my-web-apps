import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'

const options = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

/** Nút chuyển nhanh Sáng / Tối / Hệ thống. `iconOnly` dùng cho header mobile. */
export default function ThemeSwitcher({ iconOnly = false }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = options.find((o) => o.value === theme) || options[2]
  const CurrentIcon = current.icon

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t('common.switchTheme')}
        aria-label={`${t('common.switchTheme')}: ${t(`theme.${current.value}`)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`m3-ripple morph inline-flex items-center justify-center text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container-highest)] ${
          iconOnly ? 'w-10 h-10 rounded-full active:rounded-[12px]' : 'h-10 gap-2 px-4 rounded-[20px] active:rounded-[10px] text-sm font-semibold'
        }`}
      >
        <CurrentIcon size={18} key={current.value} className="anim-pop" />
        {!iconOnly && <span>{t(`theme.${current.value}`)}</span>}
        {!iconOnly && <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <div
          role="menu"
          className="anim-menu-in absolute right-0 mt-2 w-48 rounded-[20px] bg-[var(--md-surface-container-high)] shadow-[var(--shadow-modal)] p-2 z-40"
        >
          {options.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
              className={`m3-ripple w-full flex items-center gap-3 px-4 h-11 rounded-full text-sm font-semibold transition-colors ${
                theme === value
                  ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                  : 'text-[var(--md-on-surface)]'
              }`}
            >
              <Icon size={18} />
              {t(`theme.${value}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
