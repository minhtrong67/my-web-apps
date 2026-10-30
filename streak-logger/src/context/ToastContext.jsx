import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useLang } from './LangContext'

const ToastContext = createContext(null)
let idCounter = 0

/**
 * Toast (snackbar) Material 3 với 4 biến thể: info, success, error, warning.
 * Mỗi biến thể dùng cặp màu container/on-container của chủ đề đang chọn nên đọc rõ
 * ở cả giao diện sáng lẫn tối. Có thanh đếm ngược, tạm dừng khi rê chuột hoặc chạm giữ.
 */
const VARIANTS = {
  success: {
    icon: CheckCircle2,
    box: 'bg-[var(--md-success-container)] text-[var(--md-on-success-container)]',
    chip: 'bg-[var(--md-success)] text-[var(--md-on-success)]',
    bar: 'bg-[var(--md-success)]',
    role: 'status',
  },
  error: {
    icon: XCircle,
    box: 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]',
    chip: 'bg-[var(--md-error)] text-[var(--md-on-error)]',
    bar: 'bg-[var(--md-error)]',
    role: 'alert',
  },
  warning: {
    icon: AlertTriangle,
    box: 'bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)]',
    chip: 'bg-[var(--md-warning)] text-[var(--md-on-warning)]',
    bar: 'bg-[var(--md-warning)]',
    role: 'alert',
  },
  info: {
    icon: Info,
    box: 'bg-[var(--md-info-container)] text-[var(--md-on-info-container)]',
    chip: 'bg-[var(--md-info)] text-[var(--md-on-info)]',
    bar: 'bg-[var(--md-info)]',
    role: 'status',
  },
}

const DURATION = { success: 3200, info: 3600, warning: 4800, error: 5200 }
const MAX_TOASTS = 4

function ToastItem({ toast, onClose }) {
  const { t } = useLang()
  const variant = VARIANTS[toast.type] || VARIANTS.info
  const Icon = variant.icon
  const [paused, setPaused] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const remaining = useRef(toast.duration)
  const startedAt = useRef(0)
  const timer = useRef(null)

  const close = useCallback(() => {
    setLeaving(true)
    setTimeout(() => onClose(toast.id), 200)
  }, [onClose, toast.id])

  useEffect(() => {
    if (paused) return undefined
    startedAt.current = Date.now()
    timer.current = setTimeout(close, remaining.current)
    return () => {
      clearTimeout(timer.current)
      remaining.current -= Date.now() - startedAt.current
    }
  }, [paused, close])

  return (
    <div
      role={variant.role}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      className={`relative overflow-hidden flex items-center gap-3 rounded-[20px] pl-3 pr-2 py-3 shadow-[var(--shadow-modal)] ${variant.box} ${leaving ? 'anim-toast-out' : 'anim-toast-in'}`}
    >
      <span className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-[12px] ${variant.chip}`}>
        <Icon size={20} />
      </span>
      <span className="flex-1 min-w-0 text-sm font-medium leading-snug break-words">{toast.message}</span>
      <button
        type="button"
        onClick={close}
        aria-label={t('common.close')}
        title={t('common.close')}
        className="m3-ripple morph shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-full active:rounded-[10px]"
      >
        <X size={18} />
      </button>
      <span
        aria-hidden="true"
        className={`absolute left-0 bottom-0 h-1 w-full origin-left opacity-60 ${variant.bar}`}
        style={{
          animation: `toast-progress ${toast.duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const push = useCallback((message, type = 'info', duration) => {
    const id = ++idCounter
    const item = { id, message, type, duration: duration || DURATION[type] || 3600 }
    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), item])
    return id
  }, [])

  const value = useMemo(
    () => ({
      success: (msg, duration) => push(msg, 'success', duration),
      error: (msg, duration) => push(msg, 'error', duration),
      warning: (msg, duration) => push(msg, 'warning', duration),
      info: (msg, duration) => push(msg, 'info', duration),
      dismiss: remove,
    }),
    [push, remove],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-[max(0.75rem,env(safe-area-inset-top))] lg:top-auto lg:bottom-6 right-4 left-4 lg:left-auto z-[100] flex flex-col lg:flex-col-reverse gap-2 lg:w-full lg:max-w-sm pointer-events-none"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem toast={item} onClose={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
