import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { NAV_ITEMS } from '../utils/nav'

export default function CommandPalette() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const pages = useMemo(() => NAV_ITEMS.map(({ to, key, icon }) => ({ to, label: t(`nav.${key}`), icon })), [t])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((p) => p.label.toLowerCase().includes(q))
  }, [pages, query])

  // Phím tắt Ctrl+K / Cmd+K để bật/tắt, Escape để đóng.
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex].to)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4 bg-black/45 anim-scrim-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="w-full max-w-md rounded-[var(--radius-modal)] bg-[var(--md-surface-container-high)] shadow-[var(--shadow-modal)] overflow-hidden anim-dialog-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--md-outline-variant)]">
          <Search size={20} className="text-[var(--md-on-surface-variant)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.commandPalettePlaceholder')}
            className="flex-1 min-w-0 bg-transparent outline-none text-base text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)]"
          />
          <kbd className="hidden sm:inline text-[10px] font-bold text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container-highest)] rounded-md px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="text-center text-sm text-[var(--md-on-surface-variant)] py-6">{t('common.noPagesFound')}</p>
          )}
          {results.map(({ to, label, icon: Icon }, i) => (
            <button
              key={to}
              onClick={() => go(to)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`m3-ripple w-full flex items-center gap-3 px-4 h-12 rounded-full text-sm font-semibold text-left transition-colors ${
                i === activeIndex ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]' : 'text-[var(--md-on-surface)]'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {i === activeIndex && <CornerDownLeft size={13} className="shrink-0 opacity-70" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
