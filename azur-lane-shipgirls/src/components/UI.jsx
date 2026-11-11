import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check, CheckCircle2, ChevronDown, Info, X, XCircle } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'

export const cx = (...a) => a.filter(Boolean).join(' ')

/* ---------- Tooltip ---------- */
export function Tooltip({ label, children, side = 'top', className = 'inline-flex' }) {
  const ref = useRef(null)
  const timer = useRef(0)
  const [pos, setPos] = useState(null)
  const show = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const below = side === 'bottom' || r.top < 56
      setPos({ x: Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90), y: below ? r.bottom + 8 : r.top - 8, below })
    }, 150)
  }
  const hide = () => { clearTimeout(timer.current); setPos(null) }
  useEffect(() => () => clearTimeout(timer.current), [])
  if (!label) return children
  return (
    <>
      <span ref={ref} className={className} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={hide}>
        {children}
      </span>
      {pos && createPortal(
        <div role="tooltip" className="tip" style={{ left: pos.x, top: pos.y, transform: pos.below ? 'translate(-50%,0)' : 'translate(-50%,-100%)' }}>{label}</div>,
        document.body
      )}
    </>
  )
}

/* ---------- Buttons ---------- */
const TONES = {
  primary: 'bg-primary text-onp hover:brightness-110',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
  info: 'bg-sky-600 text-white hover:bg-sky-500',
  neutral: 'border border-line bg-surf2 text-fg hover:bg-line'
}

export function Btn({ tone = 'primary', icon: Icon, children, className, ...p }) {
  return (
    <button type="button" {...p} className={cx('btn', TONES[tone], className)}>
      {Icon && <Icon aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}

export function IconBtn({ label, icon: Icon, className, iconClass, ...p }) {
  return (
    <Tooltip label={label}>
      <button type="button" aria-label={label} {...p} className={cx('icon-btn', className)}>
        <Icon className={cx('h-[18px] w-[18px]', iconClass)} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}

export function Segmented({ value, onChange, options, label }) {
  const ref = useRef(null)
  const cur = Math.max(0, options.findIndex((o) => o.value === value))
  const onKey = (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!d) return
    e.preventDefault()
    const i = (cur + d + options.length) % options.length
    onChange(options[i].value)
    requestAnimationFrame(() => ref.current?.querySelectorAll('[role=radio]')[i]?.focus())
  }
  return (
    <div ref={ref} role="radiogroup" aria-label={label} onKeyDown={onKey} className="seg [&>span]:flex-1 [&>span>button]:w-full">
      {options.map((o, i) => {
        const I = o.icon
        const b = (
          <button key={o.value} type="button" role="radio" tabIndex={i === cur ? 0 : -1} aria-checked={o.value === value} aria-label={o.label || o.tip} onClick={() => onChange(o.value)} className={cx('seg-i', o.value === value && 'is-on')}>
            {I && <I aria-hidden="true" />}
            {o.label}
          </button>
        )
        return o.tip ? <Tooltip key={o.value} label={o.tip}>{b}</Tooltip> : b
      })}
    </div>
  )
}

export function Switch({ checked, onChange, label, desc }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 rounded-md border border-line bg-surf px-3 py-2.5 text-left transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {desc && <span className="mt-0.5 block text-xs text-muted">{desc}</span>}
      </span>
      <span className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-primary' : 'bg-line')}>
        <span className={cx('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
      </span>
    </button>
  )
}

/* ---------- Custom select (portal, max height + scroll, keyboard) ---------- */
export function Select({ value, onChange, options, icon: Icon, label, className }) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState(null)
  const [act, setAct] = useState(0)
  const btn = useRef(null)
  const list = useRef(null)
  const idx = options.findIndex((o) => o.value === value)
  const cur = options[idx]

  const openIt = () => { setRect(btn.current.getBoundingClientRect()); setAct(Math.max(idx, 0)); setOpen(true) }
  const close = useCallback(() => setOpen(false), [])
  const pick = (o) => { onChange(o.value); close(); btn.current?.focus() }

  useEffect(() => {
    if (!open) return
    const down = (e) => { if (!list.current?.contains(e.target) && !btn.current?.contains(e.target)) close() }
    const sc = (e) => { if (!list.current?.contains(e.target)) close() }
    document.addEventListener('mousedown', down)
    window.addEventListener('scroll', sc, true)
    window.addEventListener('resize', close)
    return () => { document.removeEventListener('mousedown', down); window.removeEventListener('scroll', sc, true); window.removeEventListener('resize', close) }
  }, [open, close])

  useLayoutEffect(() => {
    const l = list.current
    const el = l?.children[act]
    if (!l || !el) return
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 4
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 4
  }, [open, act, rect])

  const onKey = (e) => {
    const k = e.key
    if (k === 'Escape' && open) { e.stopPropagation(); close(); return }
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' ', 'Home', 'End'].includes(k)) return
    e.preventDefault()
    if (!open) { if (k !== 'Home' && k !== 'End') openIt(); return }
    if (k === 'ArrowDown') setAct((a) => Math.min(a + 1, options.length - 1))
    else if (k === 'ArrowUp') setAct((a) => Math.max(a - 1, 0))
    else if (k === 'Home') setAct(0)
    else if (k === 'End') setAct(options.length - 1)
    else pick(options[act])
  }

  let style = {}
  if (open && rect) {
    const below = window.innerHeight - rect.bottom - 12
    const above = rect.top - 12
    const up = below < 180 && above > below
    style = { left: rect.left, width: Math.max(rect.width, 160), maxHeight: Math.min(260, up ? above : below), ...(up ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }) }
  }

  return (
    <>
      <button ref={btn} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => (open ? close() : openIt())} onKeyDown={onKey} className={cx('sel', className)}>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-ink" aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate text-left" style={cur?.fontFamily ? { fontFamily: cur.fontFamily } : undefined}>{cur?.label}</span>
        <ChevronDown aria-hidden="true" className={cx('h-4 w-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && rect && createPortal(
        <ul ref={list} role="listbox" aria-label={label} className="sel-list" style={style}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value} onMouseEnter={() => setAct(i)} onClick={() => pick(o)} className={cx('sel-opt', i === act && 'is-act', o.value === value && 'is-sel')} style={o.fontFamily ? { fontFamily: o.fontFamily } : undefined}>
              <span className="min-w-0 truncate">{o.label}</span>
              {o.value === value && <Check className="h-4 w-4 shrink-0 text-ink" aria-hidden="true" />}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </>
  )
}

/* ---------- Modal / Sheet ---------- */
const stack = []
export const modalOpen = () => stack.length > 0
const SIZE = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }

export function Modal({ open, onClose, title, icon: Icon, footer, children, size = 'md', sheet = false, variant = 'dialog' }) {
  const { t } = useI18n()
  const v = sheet ? 'sheet' : variant
  const [render, setRender] = useState(open)
  const [closing, setClosing] = useState(false)
  const panel = useRef(null)
  const id = useRef({})

  useEffect(() => {
    if (open) { setRender(true); setClosing(false); return }
    if (!render) return
    setClosing(true)
    const timer = setTimeout(() => { setRender(false); setClosing(false) }, 200)
    return () => clearTimeout(timer)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!render) return
    const me = id.current
    stack.push(me)
    const prevFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      stack.splice(stack.indexOf(me), 1)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [render])

  useEffect(() => {
    if (!render || !open) return
    const k = (e) => {
      if (stack[stack.length - 1] !== id.current) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !panel.current) return
      const f = [...panel.current.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null)
      if (!f.length) { e.preventDefault(); return }
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (!panel.current.contains(a) || (e.shiftKey && (a === first || a === panel.current))) { e.preventDefault(); (e.shiftKey ? last : first).focus() }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [render, open, onClose])

  if (!render) return null
  return createPortal(
    <div className={cx('fixed inset-0 z-50 flex', v === 'dialog' && 'p-3')}>
      <div className={cx('absolute inset-0 bg-black/55 backdrop-blur-sm', closing ? 'anim-fade-out' : 'anim-fade')} onClick={onClose} />
      <div
        ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cx(
          'relative flex flex-col overflow-hidden border border-line bg-surf shadow-2xl outline-none',
          v === 'sheet' ? cx('ml-auto h-full w-full max-w-md border-y-0 border-r-0', closing ? 'anim-sheet-out' : 'anim-sheet')
            : v === 'bottom' ? cx('mt-auto max-h-[88%] w-full rounded-t-2xl border-b-0', closing ? 'anim-up-out' : 'anim-up-in')
            : cx('m-auto max-h-full w-full rounded-lg', SIZE[size], closing ? 'anim-pop-out' : 'anim-pop')
        )}
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
        <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-3.5">
          {Icon && <span className="hex grid h-9 w-9 shrink-0 place-items-center bg-primary text-onp"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>}
          <h2 className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-tight">{title}</h2>
          <IconBtn label={t('close')} icon={X} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surf2/60 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({ open, title, desc, confirmLabel, confirmIcon, tone = 'danger', onConfirm, onCancel }) {
  const { t } = useI18n()
  return (
    <Modal
      open={open} onClose={onCancel} title={title} icon={AlertTriangle} size="sm"
      footer={<>
        <Btn tone="neutral" icon={X} onClick={onCancel}>{t('cancel')}</Btn>
        <Btn tone={tone} icon={confirmIcon} onClick={onConfirm}>{confirmLabel}</Btn>
      </>}
    >
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
    </Modal>
  )
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

const VARIANTS = {
  info: { icon: Info, cls: 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100', ic: 'text-sky-500' },
  success: { icon: CheckCircle2, cls: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100', ic: 'text-emerald-500' },
  error: { icon: XCircle, cls: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100', ic: 'text-red-500' },
  warning: { icon: AlertTriangle, cls: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100', ic: 'text-amber-500' }
}

export function ToastProvider({ children }) {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const n = useRef(0)
  const dismiss = useCallback((id) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, out: true } : x)))
    setTimeout(() => setItems((p) => p.filter((x) => x.id !== id)), 220)
  }, [])
  const push = useCallback((variant, msg) => {
    const id = ++n.current
    setItems((p) => [...p.slice(-2), { id, variant, msg }])
    setTimeout(() => dismiss(id), 3200)
  }, [dismiss])
  const api = useMemo(() => ({
    info: (m) => push('info', m), success: (m) => push('success', m),
    error: (m) => push('error', m), warning: (m) => push('warning', m)
  }), [push])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex flex-col items-center gap-2 px-3 sm:items-end sm:pr-4">
          {items.map((x) => {
            const V = VARIANTS[x.variant]
            const I = V.icon
            return (
              <div key={x.id} role="status" className={cx('pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-md border px-3.5 py-3 shadow-lg', V.cls, x.out ? 'anim-toast-out' : 'anim-toast')}>
                <I className={cx('mt-0.5 h-5 w-5 shrink-0', V.ic)} aria-hidden="true" />
                <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{x.msg}</p>
                <button type="button" aria-label={t('close')} onClick={() => dismiss(x.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded opacity-60 transition hover:opacity-100"><X className="h-4 w-4" /></button>
                {!x.out && <span className="toast-bar" />}
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}
