import { useState } from 'react'
import { AlertTriangle, HelpCircle, Trash2, X } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { useLang } from '../../context/LangContext'

/**
 * Hộp thoại xác nhận cho mọi thao tác sửa/xóa/đặt lại/đăng xuất.
 * `tone` quyết định màu và biểu tượng để nhận diện hành động ngay:
 *   danger (xóa), warning (đăng xuất, đặt lại), primary (cập nhật).
 * `onConfirm` có thể async: nút hiện trạng thái đang xử lý và hộp thoại chỉ đóng
 * khi thao tác thành công, để lỗi không bị che khuất.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  confirmIcon: ConfirmIcon = Trash2,
  tone = 'danger',
}) {
  const { t } = useLang()
  const [working, setWorking] = useState(false)

  const handleConfirm = async () => {
    setWorking(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      /* lỗi đã được báo ở nơi gọi, giữ hộp thoại để người dùng thử lại */
    } finally {
      setWorking(false)
    }
  }

  const HeaderIcon = tone === 'danger' || tone === 'warning' ? AlertTriangle : HelpCircle
  const confirmVariant = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary'

  return (
    <Modal
      open={open}
      onClose={working ? () => {} : onClose}
      title={title || t('common.deleteConfirmTitle')}
      icon={HeaderIcon}
      tone={tone}
      size="sm"
      footer={
        <>
          <Button variant="secondary" icon={X} onClick={onClose} disabled={working}>
            {t('common.cancel')}
          </Button>
          <Button variant={confirmVariant} icon={ConfirmIcon} onClick={handleConfirm} loading={working}>
            {confirmLabel || t('common.delete')}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed pb-2">{body || t('common.deleteConfirmBody')}</p>
    </Modal>
  )
}
