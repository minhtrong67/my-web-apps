import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from './icons'

// Dropdown tự dựng (thay <select> mặc định của trình duyệt): danh sách bo tròn theo theme, hỗ trợ bàn phím
// (↑ ↓ Home End Enter Space Esc), tự lật lên trên khi thiếu chỗ phía dưới, đóng khi cuộn / bấm ra ngoài.
// `options`: [{ value, label }]. onChange nhận { target: { value } } để dùng thay được cho onChange của <select>.
export function optionsFromChildren(children) {
  const out = []
  Children.forEach(children, (c) => {
    if (c?.type === 'option') out.push({ value: String(c.props.value ?? c.props.children), label: c.props.children, disabled: c.props.disabled })
    else if (Array.isArray(c)) out.push(...optionsFromChildren(c))
  })
  return out
}

export default function Select({ id, value, options, onChange, disabled, className = '', 'aria-label': ariaLabel }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const listRef = useRef(null)
  const flat = options.map((o) => ({ ...o, label: Array.isArray(o.label) ? o.label.join('') : o.label }))
  const selectedIdx = Math.max(0, flat.findIndex((o) => o.value === String(value)))
  const current = flat[selectedIdx]

  const close = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) btnRef.current?.focus()
  }, [])

  function openList() {
    if (disabled) return
    setActive(selectedIdx)
    setOpen(true)
  }

  function choose(i) {
    const o = flat[i]
    if (!o || o.disabled) return
    close()
    if (o.value !== String(value)) onChange?.({ target: { value: o.value } })
  }

  // Định vị bằng portal + fixed để không bị cắt bởi thẻ cha có overflow-hidden.
  useLayoutEffect(() => {
    if (!open) return
    const r = btnRef.current.getBoundingClientRect()
    const need = Math.min(flat.length * 44 + 16, 288)
    const below = window.innerHeight - r.bottom - 12
    const up = below < need && r.top > below
    setPos({ left: r.left, width: r.width, ...(up ? { bottom: window.innerHeight - r.top + 6, maxH: Math.min(288, r.top - 12) } : { top: r.bottom + 6, maxH: Math.min(288, below) }) })
  }, [open, flat.length])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) close(false)
    }
    const onAway = (e) => { if (!listRef.current?.contains(e.target)) close(false) }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', onAway)
    window.addEventListener('scroll', onAway, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onAway)
      window.removeEventListener('scroll', onAway, true)
    }
  }, [open, close])

  // Giữ mục đang chọn / đang trỏ nằm trong vùng nhìn thấy của danh sách.
  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, pos])

  function onKeyDown(e) {
    const move = (d) => {
      e.preventDefault()
      let i = active
      for (let n = 0; n < flat.length; n++) {
        i = (i + d + flat.length) % flat.length
        if (!flat[i].disabled) break
      }
      setActive(i)
    }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList() }
      return
    }
    if (e.key === 'ArrowDown') move(1)
    else if (e.key === 'ArrowUp') move(-1)
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(flat.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active) }
    else if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'Tab') close(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`field-input select-btn text-left flex items-center ${open ? 'is-open' : ''} ${className}`}
      >
        <span className="flex-1 min-w-0 truncate">{current?.label}</span>
      </button>
      <ChevronDown
        size={18}
        className={`field-icon transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        style={{ right: 12 }}
      />
      {open && pos && createPortal(
        <ul
          ref={listRef}
          role="listbox"
          className="select-list pop-in"
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH }}
        >
          {flat.map((o, i) => {
            const selected = i === selectedIdx
            return (
              <li
                key={o.value}
                data-i={i}
                role="option"
                aria-selected={selected}
                aria-disabled={o.disabled || undefined}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`select-opt ${selected ? 'is-selected' : ''} ${i === active ? 'is-active' : ''}`}
              >
                <span className="flex-1 min-w-0 truncate">{o.label}</span>
                {selected && <Check size={18} className="shrink-0" />}
              </li>
            )
          })}
        </ul>,
        document.body
      )}
    </>
  )
}
