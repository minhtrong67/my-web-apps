import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Check, AlertTriangle, Info, X, CircleAlert } from '../components/icons'
import { useI18n } from '../i18n'

const ToastContext = createContext(null)

// Mỗi variant dùng token màu Material 3 nên tự đổi đúng ở giao diện sáng / tối và theo màu chủ đề:
//  • surface = nền thẻ · fg = màu chữ · dot = nền + màu icon (cặp primary/on-primary… đặc hơn nền thẻ để nổi bật)
const VARIANTS = {
  default: { icon: null, surface: 'bg-inverse-surface text-inverse-on-surface', dot: '', live: 'polite' },
  info: { icon: Info, surface: 'bg-secondary-container text-on-secondary-container', dot: 'bg-secondary text-on-secondary', live: 'polite' },
  success: { icon: Check, surface: 'bg-primary-container text-on-primary-container', dot: 'bg-primary text-on-primary', live: 'polite' },
  warning: { icon: AlertTriangle, surface: 'bg-tertiary-container text-on-tertiary-container', dot: 'bg-tertiary text-on-tertiary', live: 'polite' },
  error: { icon: CircleAlert, surface: 'bg-error-container text-on-error-container', dot: 'bg-error text-on-error', live: 'assertive' }
}
const DURATION = { error: 5500, warning: 4500 }
const EXIT_MS = 200

// Toast chỉ dành cho kết quả mà người dùng không tự nhìn thấy trên màn hình (xuất / nhập dữ liệu, lưu thất bại…).
// showToast(message, { type: 'default' | 'info' | 'success' | 'warning' | 'error', duration })
// Tạm dừng đếm giờ khi rê chuột / chạm giữ; đóng có animation.
export function ToastProvider({ children }) {
  const { t } = useI18n()
  const [toast, setToast] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef(null)
  const exitRef = useRef(null)
  const durationRef = useRef(3000)

  const clearTimers = () => {
    clearTimeout(timerRef.current)
    clearTimeout(exitRef.current)
  }
  useEffect(() => clearTimers, [])

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setLeaving(true)
    exitRef.current = setTimeout(() => {
      setToast(null)
      setLeaving(false)
    }, EXIT_MS)
  }, [])

  const arm = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(dismiss, durationRef.current)
  }, [dismiss])

  const showToast = useCallback((message, options = {}) => {
    clearTimers()
    const type = VARIANTS[options.type] ? options.type : 'default'
    durationRef.current = options.duration || DURATION[type] || 3000
    setLeaving(false)
    setToast({ message, type, id: Date.now() })
    arm()
  }, [arm])

  const value = useMemo(() => ({ showToast }), [showToast])
  const variant = VARIANTS[toast?.type] || VARIANTS.default
  const Icon = variant.icon

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed left-4 right-4 z-[90] flex justify-center pointer-events-none bottom-[calc(var(--safe-bottom)+6rem)] md:bottom-6"
        role={variant.live === 'assertive' ? 'alert' : 'status'}
        aria-live={variant.live}
      >
        {toast && (
          <div
            key={toast.id}
            onPointerEnter={() => clearTimeout(timerRef.current)}
            onPointerLeave={() => !leaving && arm()}
            className={`${leaving ? 'toast-exit' : 'toast-enter'} pointer-events-auto flex items-center gap-3 w-full max-w-md min-h-12 pl-3 pr-2 py-2 rounded-lg shadow-elev-3 ${variant.surface}`}
          >
            {Icon && (
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${variant.dot}`}>
                <Icon size={16} strokeWidth={2.25} />
              </span>
            )}
            <p className={`flex-1 t-body-medium ${Icon ? '' : 'pl-1'}`}>{toast.message}</p>
            <button onClick={dismiss} aria-label={t('common.close')} className="icon-btn icon-btn-sm state shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
