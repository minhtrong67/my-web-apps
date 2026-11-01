import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, UserRound } from 'lucide-react'
import { fullName, imgOrig, imgThumb } from '../lib/students.js'

export const cx = (...a) => a.filter(Boolean).join(' ')

/* ───────── Nút icon hình bình hành ───────── */
const ICON_VARIANT = {
  standard: 'text-on-surface-variant hover:bg-primary/15 hover:text-primary',
  flat: 'bg-surface-high text-on-surface-variant hover:bg-primary hover:text-on-primary',
  tonal: 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary',
  filled: 'bg-primary text-on-primary hover:brightness-110',
  hl: 'bg-hl text-on-hl hover:brightness-105',
}
export function IconButton({ variant = 'standard', size = 'md', className, children, ...p }) {
  return (
    <button
      type="button"
      {...p}
      className={cx(
        'slant slant-sm grid shrink-0 place-items-center transition-all duration-200 ease-out-back active:scale-90 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'size-9' : size === 'lg' ? 'size-12' : 'size-11',
        ICON_VARIANT[variant], className,
      )}
    >{children}</button>
  )
}

/* ───────── Chip lọc ───────── */
export function FilterChip({ selected, children, ...p }) {
  return (
    <button
      type="button" aria-pressed={selected} {...p}
      className={cx(
        'slant inline-flex h-8 items-center gap-1 px-4 text-[0.82rem] font-semibold italic transition-all duration-200 ease-out-back active:scale-95',
        selected ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest hover:text-on-surface',
      )}
    >
      {selected && <Check size={14} strokeWidth={3.5} className="-ml-1 animate-pop" />}
      {children}
    </button>
  )
}

/* ───────── Nhãn thuộc tính (tấn công / giáp / vai trò) ───────── */
const TAG_COLOR = {
  explosive: '#c0392b', penetration: '#b5850f', mystic: '#2b78cf', sonic: '#8450cf',
  light: '#b3463f', heavy: '#a88a1d', special: '#3a7ba8', elastic: '#8059b8', composite: '#677086',
}
export function Tag({ kind, children, className }) {
  return (
    <span
      className={cx('slant inline-flex h-5 items-center whitespace-nowrap px-3 text-[0.7rem] font-bold italic leading-none tracking-wide text-white [--s:5px]', !kind && 'bg-outline', className)}
      style={kind ? { background: TAG_COLOR[kind] || '#677086' } : undefined}
    >{children}</span>
  )
}
export const StudentTags = ({ s }) => (
  <>
    <Tag kind={s.atk}>{s.atkL}</Tag>
    <Tag kind={s.arm}>{s.armL}</Tag>
    <Tag>{s.roleL}</Tag>
  </>
)

export const Stars = ({ n, className }) => (
  <span className={cx('inline-flex items-center text-[1rem] leading-none tracking-tight text-star [text-shadow:0_1px_0_rgb(0_0_0/0.18)]', className)} role="img" aria-label={`${n} stars`}>{'★'.repeat(n)}</span>
)

/* ───────── Ảnh học sinh: skeleton → thumb → ảnh gốc → icon (KHÔNG có lớp phủ nào đè lên ảnh) ───────── */
export function Portrait({ s, w = 200, full = false, className, imgClass }) {
  const first = full ? imgOrig(s.img) : imgThumb(s.img, w)
  const [src, setSrc] = useState(first)
  const [st, setSt] = useState('load')
  useEffect(() => { setSrc(first); setSt('load') }, [first])
  const onError = () => {
    const alt = full ? imgThumb(s.img, w) : imgOrig(s.img)
    if (src !== alt) setSrc(alt); else setSt('err')
  }
  return (
    <div className={cx('relative overflow-hidden', st === 'load' && 'skeleton', className)}>
      {st === 'err'
        ? <div className="grid size-full place-items-center text-on-surface-variant/50"><UserRound size={40} /></div>
        : <img
            ref={(el) => { if (el && el.complete && el.naturalWidth && st === 'load') setSt('ok') }}
            src={src} alt={fullName(s)} decoding="async" loading={full ? 'eager' : 'lazy'}
            srcSet={!full && src === first ? `${imgThumb(s.img, w)} 1x, ${imgThumb(s.img, w * 2)} 2x` : undefined}
            onLoad={() => setSt('ok')} onError={onError}
            className={cx('size-full object-cover object-top transition-opacity duration-500', st === 'ok' ? 'opacity-100' : 'opacity-0', imgClass)}
          />}
    </div>
  )
}

/* ───────── Switch hình bình hành ───────── */
export function Switch({ checked, onChange, label, hint }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span className="flex min-w-0 flex-col">
        <b className="font-bold italic">{label}</b>
        {hint && <small className="text-on-surface-variant">{hint}</small>}
      </span>
      <span className={cx('slant relative h-8 w-16 shrink-0 transition-colors duration-200 [--s:8px]', checked ? 'bg-primary' : 'bg-surface-highest')}>
        <span className={cx('slant absolute top-1 grid h-6 w-8 place-items-center transition-all duration-300 ease-out-back [--s:6px]', checked ? 'left-[30px] bg-white text-primary' : 'left-1 bg-outline text-white')}>
          {checked && <Check size={14} strokeWidth={4} />}
        </span>
      </span>
    </button>
  )
}

/* ───────── Tab phân đoạn hình bình hành ───────── */
export function Segmented({ value, onChange, options, className }) {
  return (
    <div role="radiogroup" className={cx('flex gap-1', className)}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value} type="button" role="radio" aria-checked={on} aria-label={o.label} title={o.label}
            onClick={() => onChange(o.value)}
            className={cx(
              'slant flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-4 text-sm font-semibold italic transition-all duration-200 ease-out-back active:scale-95',
              on ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest hover:text-on-surface',
            )}
          >
            {o.icon}
            {!o.iconOnly && <span>{o.label}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ───────── Select tùy chỉnh (sáng/tối, cuộn khi dài, điều khiển bằng phím) ───────── */
export function Select({ value, options, onChange, label, icon: Icon, className }) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const root = useRef(null), listRef = useRef(null), uid = useId()
  const cur = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    if (!open) return
    const off = (e) => { if (!root.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', off)
    return () => document.removeEventListener('pointerdown', off)
  }, [open])
  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-hi="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [open, hi])

  const choose = (v) => { onChange(v); setOpen(false); root.current?.querySelector('button')?.focus() }
  const onKey = (e) => {
    if (!open) { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); setHi(Math.max(0, options.indexOf(cur))); setOpen(true) } return }
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setHi(0) }
    else if (e.key === 'End') { e.preventDefault(); setHi(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[hi].value) }
    else if (e.key === 'Tab') setOpen(false)
  }
  return (
    <div ref={root} className={cx('relative min-w-0', className)} onKeyDown={onKey}>
      <button
        type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={uid} aria-label={label}
        onClick={() => { setHi(Math.max(0, options.indexOf(cur))); setOpen((o) => !o) }}
        className="slant flex h-10 w-full items-center gap-2 bg-surface-high px-6 text-sm font-semibold italic text-on-surface transition-colors hover:bg-surface-highest"
      >
        {Icon && <Icon size={17} className="shrink-0 text-primary" />}
        <span className="min-w-0 flex-1 truncate text-left">{cur?.label}</span>
        <ChevronDown size={17} className={cx('shrink-0 text-primary transition-transform duration-300 ease-out-back', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          id={uid} ref={listRef} role="listbox" aria-label={label}
          className="absolute left-0 top-full z-40 mt-2 max-h-72 w-64 animate-pop overflow-y-auto border-2 border-primary bg-surface-low p-1 shadow-[0_14px_40px_-10px_rgb(0_0_0/0.45)] max-md:w-[min(16rem,calc(100vw-2rem))]"
        >
          {options.map((o, i) => (
            <li
              key={o.value} role="option" aria-selected={o.value === value} data-hi={i === hi}
              onPointerEnter={() => setHi(i)} onClick={() => choose(o.value)}
              className={cx('flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-medium', i === hi && 'bg-primary/10', o.value === value && '!bg-primary font-bold italic text-on-primary')}
            >
              <span className="flex-1">{o.label}</span>
              {o.value === value && <Check size={16} strokeWidth={3.5} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* Nhãn tiêu đề hình bình hành (dùng cho các khối trong chi tiết / cài đặt) */
export function TitleTab({ icon: Icon, children, className }) {
  return (
    <h3 className={cx('slant mb-3 -ml-1 inline-flex h-8 items-center gap-2 bg-primary pl-4 pr-7 text-sm font-bold italic tracking-wide text-on-primary [--s:9px]', className)}>
      {Icon && <Icon size={16} strokeWidth={2.5} />}{children}
    </h3>
  )
}
