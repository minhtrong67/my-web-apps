import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useOverlay, usePresence } from '../../hooks/useOverlay'
import { useLang } from '../../context/LangContext'

/**
 * Sheet Material 3.
 * - variant="full": toàn màn hình, dùng cho form nhiều trường. Có thanh tiêu đề và thanh hành động
 *   dính ở cuối; nội dung cuộn ở giữa và được căn giữa, rộng tối đa 672px trên màn hình lớn.
 * - variant="bottom": sheet đáy, trượt từ dưới lên, dùng cho danh sách lựa chọn ngắn trên mobile.
 */
export default function Sheet({ open, onClose, title, variant = 'full', children, footer }) {
  const { t } = useLang()
  const { mounted, closing } = usePresence(open, 260)
  useOverlay(open, onClose)

  if (!mounted) return null

  if (variant === 'bottom') {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div
          className={`absolute inset-0 bg-black/45 ${closing ? 'anim-scrim-out' : 'anim-scrim-in'}`}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative w-full max-w-lg bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)] rounded-t-[28px] shadow-[var(--shadow-modal)] max-h-[85dvh] flex flex-col pb-[env(safe-area-inset-bottom)] ${closing ? 'anim-sheet-out' : 'anim-sheet-in'}`}
        >
          <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
            <span className="w-8 h-1 rounded-full bg-[var(--md-outline)] opacity-60" />
          </div>
          {title && <h2 className="px-6 pt-2 pb-3 text-lg font-bold tracking-tight">{title}</h2>}
          <div className="px-3 pb-4 overflow-y-auto overscroll-contain-y">{children}</div>
          {footer && <div className="px-6 pb-5 flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`fixed inset-0 z-50 flex flex-col bg-[var(--md-surface)] text-[var(--md-on-surface)] pt-[env(safe-area-inset-top)] ${closing ? 'anim-sheet-out' : 'anim-sheet-in'}`}
    >
      <header className="flex items-center gap-2 px-3 sm:px-6 h-16 shrink-0 bg-[var(--md-surface-container)]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          title={t('common.close')}
          className="m3-ripple morph w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)]"
        >
          <X size={22} />
        </button>
        <h2 className="flex-1 min-w-0 text-lg sm:text-xl font-bold tracking-tight truncate">{title}</h2>
      </header>
      <div className="flex-1 overflow-y-auto overscroll-contain-y">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </div>
      {footer && (
        <footer className="shrink-0 bg-[var(--md-surface-container)] pb-[env(safe-area-inset-bottom)]">
          <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">{footer}</div>
        </footer>
      )}
    </div>,
    document.body,
  )
}
