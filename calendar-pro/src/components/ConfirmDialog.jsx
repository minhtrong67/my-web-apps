import { useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import Button from './Button'
import { useTranslation } from '../i18n/useTranslation'
import { useExitTransition } from '../hooks/useExitTransition'
import { useModal } from '../hooks/useModal'

/**
 * ConfirmDialog — hộp thoại xác nhận gọn: tiêu đề + nội dung căn trái, 2 nút (huỷ dạng viền, xác nhận dạng đặc).
 * Render qua Portal như Sheet để tránh lệch vị trí; có animation vào/ra và quản lý focus.
 */
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }) {
  const { t } = useTranslation()
  const { mounted, closing } = useExitTransition(open, 160)
  const panelRef = useRef(null)
  useModal(open, onClose, panelRef)

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className={`absolute inset-0 bg-black/45 ${closing ? 'scrim-out' : 'scrim-in'}`} onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`${closing ? 'animate-palette-out' : 'animate-palette-in'} relative z-10 w-full max-w-sm rounded-[28px] bg-surface-high p-6 shadow-elevated outline-none`}
      >
        <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${danger ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
          <Icon name={danger ? 'warning' : 'help'} size={28} filled />
        </span>
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            className={danger ? '!bg-error !text-on-error' : ''}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
