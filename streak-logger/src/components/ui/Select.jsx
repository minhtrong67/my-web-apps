import { Children, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { fieldBase } from './Input'

/**
 * Dropdown tự vẽ thay cho <select> gốc (select gốc không theo được giao diện sáng/tối và
 * màu chủ đề). Giữ cách dùng quen thuộc: truyền <option value> làm children và nhận
 * onChange({ target: { value } }). Danh sách mở bằng portal nên không bị cắt bởi accordion
 * hay hộp thoại, tự lật lên trên khi thiếu chỗ phía dưới, cao tối đa 280px và có thanh cuộn.
 */
const MAX_LIST_HEIGHT = 280
const GAP = 6

export default function Select({ value, onChange, children, className = '', placeholder, ...props }) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .map((c) => ({ value: String(c.props.value ?? ''), label: c.props.children })),
    [children],
  )
  const selectedIndex = options.findIndex((o) => o.value === String(value ?? ''))
  const selected = options[selectedIndex]

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const close = useCallback(() => setOpen(false), [])

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom - GAP - 8
    const above = rect.top - GAP - 8
    const openUp = below < Math.min(MAX_LIST_HEIGHT, options.length * 44 + 16) && above > below
    setPos({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, Math.min(MAX_LIST_HEIGHT, openUp ? above : below)),
      ...(openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
      openUp,
    })
  }, [options.length])

  const openList = () => {
    place()
    setActive(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const choose = (index) => {
    const option = options[index]
    if (!option) return
    onChange?.({ target: { value: option.value } })
    close()
    triggerRef.current?.focus({ preventScroll: true })
  }

  // Đóng khi bấm ra ngoài, đổi kích thước hoặc cuộn bên ngoài danh sách; Escape chỉ đóng dropdown.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close()
    }
    const onScroll = (e) => {
      if (!listRef.current?.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        triggerRef.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', close)
    }
  }, [open, close])

  // Cuộn mục đang chọn vào vùng nhìn thấy.
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const onTriggerKey = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    if (!open) return openList()
    if (e.key === 'ArrowDown') setActive((i) => Math.min(options.length - 1, i + 1))
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(0, i - 1))
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(options.length - 1)
    else choose(active)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKey}
        className={`${fieldBase} flex items-center justify-between gap-2 text-left pr-3 ${open ? '!border-[var(--md-primary)]' : ''} ${className}`}
        {...props}
      >
        <span className={`truncate ${selected ? '' : 'opacity-70'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} className={`shrink-0 text-[var(--md-on-surface-variant)] transition-transform duration-300 ease-[var(--ease-spring)] ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            style={{
              position: 'fixed',
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              top: pos.top,
              bottom: pos.bottom,
              transformOrigin: pos.openUp ? 'bottom center' : 'top center',
            }}
            className="anim-menu-in z-[120] overflow-y-auto overscroll-contain-y rounded-[20px] bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] shadow-[var(--shadow-modal)] p-1.5"
          >
            {options.map((o, i) => {
              const isSelected = i === selectedIndex
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`flex items-center justify-between gap-2 min-h-11 px-4 py-2 rounded-[14px] text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] font-bold'
                      : active === i
                        ? 'bg-[color-mix(in_oklab,var(--md-on-surface)_8%,transparent)]'
                        : ''
                  }`}
                >
                  <span className="min-w-0 break-words">{o.label}</span>
                  {isSelected && <Check size={16} strokeWidth={3} className="shrink-0" />}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </>
  )
}
