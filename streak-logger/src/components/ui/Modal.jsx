import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useOverlay, usePresence } from '../../hooks/useOverlay'
import { useLang } from '../../context/LangContext'

const TONES = {
  danger: 'bg-[var(--md-error-container)] text-[var(--md-on-error-container)]',
  warning: 'bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)]',
  primary: 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]',
  info: 'bg-[var(--md-info-container)] text-[var(--md-on-info-container)]',
  success: 'bg-[var(--md-success-container)] text-[var(--md-on-success-container)]',
}

/**
 * Hộp thoại (dialog) Material 3: căn giữa, bo 28px, phóng ra bằng lò xo.
 * Dùng cho form ít trường, xem chi tiết và xác nhận; form nhiều trường dùng <Sheet />.
 * `footer` là hàng nút hành động: mỗi nút nên có đủ nhãn, biểu tượng và màu nền.
 */
export default function Modal({ open, onClose, title, icon: Icon, tone = 'primary', children, footer, size = 'md' }) {
  const { t } = useLang()
  const { mounted, closing } = usePresence(open, 200)
  useOverlay(open, onClose)

  if (!mounted) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/45 ${closing ? 'anim-scrim-out' : 'anim-scrim-in'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widths[size]} bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] rounded-[var(--radius-modal)] shadow-[var(--shadow-modal)] max-h-[90dvh] flex flex-col ${closing ? 'anim-dialog-out' : 'anim-dialog-in'}`}
      >
        <div className="flex items-start gap-3 px-6 pt-6 pb-3">
          {Icon && (
            <span className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-[16px] ${TONES[tone] || TONES.primary}`}>
              <Icon size={22} />
            </span>
          )}
          <h2 className="flex-1 min-w-0 pt-1.5 text-xl font-bold tracking-tight leading-snug break-words">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            title={t('common.close')}
            className="m3-ripple morph -mr-2 -mt-1 w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-2 overflow-y-auto overscroll-contain-y text-[var(--md-on-surface-variant)]">{children}</div>
        {footer && <div className="px-6 pt-4 pb-6 grid grid-cols-2 gap-3 [&>*]:w-full">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
