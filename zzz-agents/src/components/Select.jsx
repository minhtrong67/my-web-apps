import { useEffect, useRef, useState } from 'react'

// Dropdown tùy chỉnh (không dùng <select> mặc định)
export default function Select({ value, options, onChange, label, align }) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const ref = useRef(null)
  const idx = options.findIndex((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const out = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', out)
    return () => document.removeEventListener('pointerdown', out)
  }, [open])

  const toggle = () => { setHi(Math.max(idx, 0)); setOpen((o) => !o) }
  const pick = (o) => { onChange(o.value); setOpen(false) }
  const onKey = (e) => {
    if (e.key === 'Escape') return setOpen(false)
    if (e.key === 'ArrowDown') { e.preventDefault(); open ? setHi((h) => (h + 1) % options.length) : toggle() }
    if (e.key === 'ArrowUp') { e.preventDefault(); open && setHi((h) => (h - 1 + options.length) % options.length) }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open ? pick(options[hi]) : toggle() }
  }
  const cur = options[idx]

  return (
    <div ref={ref} className="relative" onKeyDown={onKey}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={toggle}
        className="cut-sm flex h-11 w-full items-center justify-between gap-2 border border-line bg-surface px-3 text-left transition-colors hover:border-p">
        <span className="truncate whitespace-nowrap" style={{ fontFamily: cur?.font }}>{cur?.label}</span>
        <svg className={`h-4 w-4 shrink-0 text-pt transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <ul role="listbox" className={`pop cut-sm absolute z-50 mt-1 max-h-64 w-max min-w-full max-w-[85vw] overflow-auto border border-p bg-surface p-1 shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}
              style={{ fontFamily: o.font }}
              className={`flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap px-3 py-2 ${i === hi ? 'bg-p/20' : ''} ${o.value === value ? 'font-bold text-pt' : ''}`}>
              {o.label}
              {o.value === value && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-10" /></svg>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
