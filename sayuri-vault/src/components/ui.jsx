import { useEffect, useRef, useState } from 'react'
import { KeyRound, Tag, Network, Tags, User, AtSign, Sparkles, Film, House, Settings, Search, Plus, Pencil, Trash2, Download, Upload, CloudUpload,
  FileText, FileSpreadsheet, FileDown, Sun, Moon, Monitor, Check, X, Eye, EyeOff, LogIn, LogOut, ChevronsLeft, ChevronsRight, ChevronDown,
  LayoutGrid, List, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown, FilterX, CloudOff, Lock, LockOpen, ShieldCheck, Info, CircleCheck,
  CircleAlert, TriangleAlert, Languages, Palette, Type, Heart, Bot, ArrowLeft, ChevronUp, Database, Circle } from 'lucide-react'
import { useData } from '../data'
import { STYLE } from '../config/modules'
import { useT } from '../i18n'

const MAP = { key: KeyRound, tag: Tag, account_tree: Network, sell: Tags, person: User, alternate_email: AtSign, auto_awesome: Sparkles, movie: Film,
  home: House, settings: Settings, search: Search, add: Plus, edit: Pencil, delete: Trash2, download: Download, upload_file: Upload, cloud_upload: CloudUpload,
  csv: FileText, table_view: FileSpreadsheet, picture_as_pdf: FileDown, light_mode: Sun, dark_mode: Moon, contrast: Monitor, check: Check, close: X,
  visibility: Eye, visibility_off: EyeOff, login: LogIn, logout: LogOut, left: ChevronsLeft, right: ChevronsRight, down: ChevronDown, grid_view: LayoutGrid,
  view_list: List, filter_list: SlidersHorizontal, arrow_upward: ArrowUp, arrow_downward: ArrowDown, sort: ArrowUpDown, filter_alt_off: FilterX,
  cloud_off: CloudOff, lock: Lock, lock_open: LockOpen, enhanced_encryption: ShieldCheck, info: Info, success: CircleCheck, error: CircleAlert,
  warning: TriangleAlert, language: Languages, palette: Palette, type: Type, heart: Heart, bot: Bot, back: ArrowLeft, up: ChevronUp, apps: LayoutGrid,
  user: User, database: Database, sparkles: Sparkles }

export const Icon = ({ name, size = 20 }) => { const C = MAP[name] || Circle; return <C size={size} strokeWidth={2} className="lu" aria-hidden="true" /> }

export const cookie = (n, a = 5) =>
  'polygon(' + Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * Math.PI * 2, r = 50 - a + a * Math.cos(n * t)
    return `${(50 + r * Math.cos(t)).toFixed(1)}% ${(50 + r * Math.sin(t)).toFixed(1)}%`
  }).join() + ')'

export const hue = (key) => ({ '--h': STYLE[key]?.h })

// Đếm số tăng dần (hiệu ứng)
export function useCount(n) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, t0
    const step = (t) => { t0 ??= t; const p = Math.min((t - t0) / 700, 1); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [n])
  return v
}

export function Modal({ onClose, style, children }) {
  const ref = useRef()
  useEffect(() => { ref.current.showModal() }, [])
  return <dialog ref={ref} className="dlg" style={style} onClose={onClose}>{children}</dialog>
}

export function Confirm({ title, text, label, icon = 'delete', danger = true, onConfirm, onClose }) {
  const t = useT()
  return (
    <Modal onClose={onClose}>
      <h2><Icon name={icon} size={26} />{title}</h2>
      <p>{text}</p>
      <div className="btns">
        <button className="b n" onClick={onClose}><Icon name="close" />{t('cancel')}</button>
        <button className={`b ${danger ? 'e' : 'p'}`} onClick={onConfirm}><Icon name={icon} />{label}</button>
      </div>
    </Modal>
  )
}

export function Toasts() {
  const { toasts, dismiss } = useData()
  return (
    <div className="snack" role="status" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={`tst ${x.type}`}>
          <Icon name={x.type} size={22} />
          <span className="tm">{x.msg}</span>
          {x.label && <button className="ta" onClick={() => { x.fn(); dismiss(x.id) }}>{x.label}</button>}
          <button className="ic" onClick={() => dismiss(x.id)} aria-label="Close"><Icon name="close" size={18} /></button>
          <span className="tb" style={{ animationDuration: `${x.ms}ms` }} />
        </div>
      ))}
    </div>
  )
}
