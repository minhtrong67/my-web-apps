import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { detectLang, makeT } from './i18n.js'
import { applyScheme } from './theme.js'

/* ───────────── localStorage an toàn ───────────── */
export const readLS = (k, d) => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || '{}') } } catch { return { ...d } } }
export const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* bỏ qua */ } }

/* ───────────── Cài đặt (giao diện, ngôn ngữ) ───────────── */
export const DEFAULTS = { theme: 'system', fs: 15, ff: 'sans', ac: '#128cff', motion: 1 }
export const ACCENTS = ['#128cff', '#e8508c', '#16a085', '#8a63f0', '#f0801f', '#d93a3f']
const SettingsCtx = createContext(null)
export const useSettings = () => useContext(SettingsCtx)

export function SettingsProvider({ children }) {
  const [cfg, setCfg] = useState(() => {
    const c = readLS('ba-cfg', DEFAULTS)
    return { ...DEFAULTS, ...c, lang: c.lang === 'vi' || c.lang === 'en' ? c.lang : detectLang() }
  })
  const [sysDark, setSysDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)'), on = (e) => setSysDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const dark = cfg.theme === 'dark' || (cfg.theme === 'system' && sysDark)
  useLayoutEffect(() => {
    const r = document.documentElement
    r.dataset.theme = dark ? 'dark' : 'light'
    r.dataset.ff = cfg.ff
    r.lang = cfg.lang
    if (cfg.motion === 0) r.dataset.motion = 'off'; else delete r.dataset.motion
    r.style.fontSize = `${(cfg.fs / 15) * 16}px`
    applyScheme(cfg.ac, dark ? 'dark' : 'light')
    writeLS('ba-cfg', cfg)
  }, [cfg, dark])

  const update = useCallback((patch) => setCfg((c) => ({ ...c, ...patch })), [])
  const reset = useCallback(() => setCfg((c) => ({ ...DEFAULTS, lang: c.lang })), [])
  const t = useMemo(() => makeT(cfg.lang), [cfg.lang])
  const value = useMemo(() => ({ cfg, update, reset, t, dark, lang: cfg.lang }), [cfg, update, reset, t, dark])
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>
}

/* ───────────── Toast (info / success / warning / error) ───────────── */
const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

const TOAST_STYLE = {
  success: { Icon: CircleCheck, tile: 'bg-ok text-white', bar: 'bg-ok' },
  info: { Icon: Info, tile: 'bg-primary text-on-primary', bar: 'bg-primary' },
  warning: { Icon: TriangleAlert, tile: 'bg-hl text-on-hl', bar: 'bg-hl' },
  error: { Icon: CircleAlert, tile: 'bg-error text-on-error', bar: 'bg-error' },
}

function ToastItem({ toast, onDone }) {
  const [out, setOut] = useState(false)
  const { Icon, tile, bar } = TOAST_STYLE[toast.type] || TOAST_STYLE.info
  const kill = useCallback(() => { setOut(true); setTimeout(() => onDone(toast.id), 220) }, [onDone, toast.id])
  useEffect(() => { const h = setTimeout(kill, toast.ms); return () => clearTimeout(h) }, [kill, toast.ms])
  return (
    <div
      onClick={kill}
      role={toast.type === 'error' ? 'alert' : 'status'}
      style={{ '--ms': toast.ms + 'ms' }}
      className={`pointer-events-auto cursor-pointer drop-shadow-[0_8px_14px_rgb(0_0_0/0.4)] ${out ? 'animate-[toast-out_0.22s_ease-in_forwards]' : 'animate-[toast-in_0.4s_var(--ease-smooth)]'}`}
    >
      <div className="slant relative flex min-w-[260px] max-w-[min(440px,100%)] items-center gap-3 overflow-hidden bg-navy py-2 pl-2 pr-10 text-on-navy [--s:14px]">
        <span className={`slant grid size-10 shrink-0 place-items-center [--s:8px] ${tile}`}><Icon size={22} strokeWidth={2.4} /></span>
        <div className="flex min-w-0 flex-col leading-snug">
          <b className="font-bold italic">{toast.msg}</b>
          {toast.sub && <small className="truncate text-on-navy/70">{toast.sub}</small>}
        </div>
        <i className={`absolute inset-x-0 bottom-0 h-[3px] origin-left ${bar} animate-[toast-bar_var(--ms)_linear_forwards]`} />
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [list, setList] = useState([])
  const box = useRef(null), shownAt = useRef(0), idRef = useRef(0)
  const popover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype

  const push = useCallback((type, msg, { sub = '', ms = 2800, key = '' } = {}) => {
    const id = ++idRef.current
    setList((l) => [...l.filter((x) => !key || x.key !== key), { id, type, msg, sub, ms, key }].slice(-3))
  }, [])
  const done = useCallback((id) => setList((l) => l.filter((x) => x.id !== id)), [])
  const api = useMemo(() => ({
    success: (m, o) => push('success', m, o), info: (m, o) => push('info', m, o),
    warning: (m, o) => push('warning', m, o), error: (m, o) => push('error', m, o),
  }), [push])

  /* Popover nằm trong top-layer → luôn nổi trên <dialog>; bật lại nếu sheet mở sau toast */
  useLayoutEffect(() => {
    const el = box.current
    if (!el || !popover) return
    const open = el.matches(':popover-open')
    if (!list.length) { if (open) el.hidePopover(); return }
    try {
      if (!open) { el.showPopover(); shownAt.current = performance.now() }
      else if ((window.__sheetAt || 0) > shownAt.current) { el.hidePopover(); el.showPopover(); shownAt.current = performance.now() }
    } catch { /* bỏ qua */ }
  }, [list, popover])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div id="toasts" ref={box} popover={popover ? 'manual' : undefined}>
        <div className="flex flex-col items-center gap-2 md:items-start" aria-live="polite">
          {list.map((x) => <ToastItem key={x.id} toast={x} onDone={done} />)}
        </div>
      </div>
    </ToastCtx.Provider>
  )
}

/* ───────────── Yêu thích ───────────── */
export function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ba-fav') || '[]')) } catch { return new Set() }
  })
  useEffect(() => { writeLS('ba-fav', [...favs]) }, [favs])
  const toggle = useCallback((name) => {
    setFavs((s) => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n })
  }, [])
  const addMany = useCallback((names) => setFavs((s) => new Set([...s, ...names])), [])
  return { favs, toggle, addMany }
}

/* ───────────── Sao chép (có fallback) ───────────── */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* thử cách cũ */ }
  try {
    const a = document.createElement('textarea')
    a.value = text; a.setAttribute('readonly', '')
    a.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    ;(document.querySelector('dialog[open]') || document.body).append(a)
    a.select()
    const ok = document.execCommand('copy')
    a.remove()
    return ok
  } catch { return false }
}
