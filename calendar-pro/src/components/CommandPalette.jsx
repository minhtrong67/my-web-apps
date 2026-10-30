import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'
import { useExitTransition } from '../hooks/useExitTransition'

/**
 * CommandPalette — bảng tìm kiếm nhanh menu, mở bằng Ctrl+K (hoặc Cmd+K trên macOS).
 * Điều khiển bằng bàn phím: mũi tên lên/xuống để chọn, Enter để đi tới, Esc để đóng.
 */
export default function CommandPalette({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const { mounted, closing } = useExitTransition(open, 160)

  const ITEMS = useMemo(
    () => [
      { to: '/', label: t('nav.home'), icon: 'home' },
      { to: '/lich', label: t('nav.calendarFull'), icon: 'calendar_month' },
      { to: '/van-nien', label: t('nav.vanNienFull'), icon: 'auto_stories' },
      { to: '/dem-nguoc', label: t('nav.countdownFull'), icon: 'hourglass_top' },
      { to: '/cai-dat', label: t('nav.settings'), icon: 'settings' }
    ],
    [t]
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ITEMS
    return ITEMS.filter((item) => item.label.toLowerCase().includes(q))
  }, [ITEMS, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function go(item) {
    navigate(item.to)
    onClose()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      go(results[activeIndex])
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label={t('commandPalette.placeholder')}>
      <div className={`absolute inset-0 bg-black/40 ${closing ? 'scrim-out' : 'scrim-in'}`} onClick={onClose} />
      <div className={`${closing ? 'animate-palette-out' : 'animate-palette-in'} relative z-10 w-full max-w-lg overflow-hidden rounded-[28px] bg-surface-high shadow-elevated`}>
        <div className="m-3 flex h-14 items-center gap-3 rounded-full bg-surface-highest px-5">
          <Icon name="search" size={22} className="shrink-0 text-on-surface-variant" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('commandPalette.placeholder')}
            className="w-full min-w-0 flex-1 bg-transparent text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant/70"
            aria-label={t('commandPalette.placeholder')}
          />
          <kbd className="hidden shrink-0 rounded-full bg-surface-high px-2 py-0.5 text-label-sm text-on-surface-variant sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto px-3 pb-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-body-md text-on-surface-variant">{t('commandPalette.noResults')}</p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.to}
                onClick={() => go(item)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`state morph-square focus-ring flex h-14 w-full items-center gap-4 rounded-full px-5 text-left text-body-lg text-on-surface ${
                  i === activeIndex ? 'bg-secondary-container text-on-secondary-container' : ''
                }`}
              >
                <Icon name={item.icon} size={24} filled={i === activeIndex} weight={i === activeIndex ? 500 : 400} />
                {item.label}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-5 pb-4 pt-2 text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <kbd className="rounded-md bg-surface-highest px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded-md bg-surface-highest px-1.5 py-0.5">↓</kbd> {t('commandPalette.hint')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-md bg-surface-highest px-1.5 py-0.5">Enter</kbd> {t('commandPalette.selectHint')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-md bg-surface-highest px-1.5 py-0.5">Esc</kbd> {t('commandPalette.closeHint')}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
