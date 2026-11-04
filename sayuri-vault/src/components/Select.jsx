import { useEffect, useRef, useState } from 'react'
import { Icon } from './ui'

// Dropdown tuỳ chỉnh (hỗ trợ sáng/tối, giới hạn chiều cao + cuộn). free = ô nhập có gợi ý.
export default function Select({ value, onChange, options, free, placeholder, icon, required, className = '' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const [hi, setHi] = useState(-1)
  const box = useRef(), list = useRef()
  const opts = options.map((o) => (typeof o === 'string' ? { v: o, l: o } : o))
  const shown = free ? opts.filter((o) => o.l.toLowerCase().includes((value || '').toLowerCase())) : opts
  const cur = opts.find((o) => o.v === value)

  const show = () => {
    const r = box.current.getBoundingClientRect()
    const need = Math.min(260, shown.length * 42 + 12), below = innerHeight - r.bottom
    const up = below < need + 16 && r.top > below
    setPos({ left: r.left, minWidth: Math.max(r.width, 180), ...(up ? { bottom: innerHeight - r.top + 6 } : { top: r.bottom + 6 }) })
    setHi(shown.findIndex((o) => o.v === value)); setOpen(true)
  }
  useEffect(() => {
    if (!open) return
    const down = (e) => { if (!box.current?.contains(e.target) && !list.current?.contains(e.target)) setOpen(false) }
    const scroll = (e) => { if (!list.current?.contains(e.target)) setOpen(false) }
    const close = () => setOpen(false)
    document.addEventListener('pointerdown', down); addEventListener('scroll', scroll, true); addEventListener('resize', close)
    return () => { document.removeEventListener('pointerdown', down); removeEventListener('scroll', scroll, true); removeEventListener('resize', close) }
  }, [open])
  useEffect(() => { list.current?.querySelector('.hi')?.scrollIntoView({ block: 'nearest' }) }, [hi, open])

  const pick = (o) => { onChange(o.v); setOpen(false) }
  const key = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!open) return show()
      setHi((h) => Math.min(Math.max(h + (e.key === 'ArrowDown' ? 1 : -1), 0), shown.length - 1))
    } else if (e.key === 'Enter' && open && shown[hi]) { e.preventDefault(); pick(shown[hi]) }
    else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false) }
  }

  return (
    <div ref={box} className={`selw ${className}`} onKeyDown={key}>
      {free
        ? <input value={value || ''} required={required} placeholder={placeholder} autoComplete="off"
            onChange={(e) => { onChange(e.target.value); if (!open) show() }} onFocus={() => !open && show()} />
        : <button type="button" className="sel" onClick={() => (open ? setOpen(false) : show())} aria-haspopup="listbox" aria-expanded={open}>
            {icon && <Icon name={icon} size={18} />}<span>{cur?.l ?? placeholder}</span><Icon name="down" size={18} />
          </button>}
      {open && shown.length > 0 && (
        <ul ref={list} className="opts" style={pos} role="listbox">
          {shown.map((o, i) => (
            <li key={o.v} role="option" aria-selected={o.v === value} className={i === hi ? 'hi' : ''}
              onPointerDown={(e) => { e.preventDefault(); pick(o) }} onMouseEnter={() => setHi(i)}>
              <span>{o.l}</span>{o.v === value && <Icon name="check" size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
