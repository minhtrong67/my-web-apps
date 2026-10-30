import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Icon from '../components/Icon'

const ToastContext = createContext(null)

const ICON_NAMES = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning'
}

// Snackbar dùng nền đảo (inverse) nên icon trạng thái phải đủ tương phản trên cả nền sáng lẫn tối
const RING = {
  success: 'text-chay-container dark:text-chay',
  error: 'text-error-container dark:text-error',
  info: 'text-inverse-primary',
  warning: 'text-holiday-container dark:text-holiday'
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Đánh dấu "đang rời" để chạy animation thoát rồi mới gỡ khỏi DOM
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 220)
  }, [])

  const notify = useCallback(
    (message, { type = 'info', title, duration = 3200 } = {}) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type, title }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast: nằm phía dưới, trên thanh điều hướng ở di động */}
      <div
        className="pointer-events-none fixed left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2 bottom-[calc(env(safe-area-inset-bottom)+5rem)] sm:bottom-6"
        role="region"
        aria-live="polite"
        aria-label="Thông báo"
      >
        {toasts.map((t) => {
          const iconName = ICON_NAMES[t.type] ?? 'info'
          return (
            <div
              key={t.id}
              className={`${t.leaving ? 'animate-toast-out' : 'animate-toast-in'} pointer-events-auto flex items-center gap-3 rounded-2xl bg-inverse-surface py-3 pl-4 pr-2 text-inverse-on-surface shadow-elevated`}
            >
              <Icon name={iconName} filled size={22} className={`shrink-0 ${RING[t.type]}`} />
              <div className="min-w-0 flex-1">
                {t.title && <p className="text-label-lg">{t.title}</p>}
                <p className="text-body-md opacity-90">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="state morph-square focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                aria-label="Đóng thông báo"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast phải được dùng trong ToastProvider')
  return ctx
}
