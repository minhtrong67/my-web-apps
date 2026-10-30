import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Button from './ui/Button'
import ConfirmDialog from './ui/ConfirmDialog'

/** Ảnh đại diện Google, nếu không có ảnh thì hiện chữ cái đầu của tên. */
export function Avatar({ user, size = 36 }) {
  const initial = (user?.displayName || user?.email || '?').trim().charAt(0).toUpperCase()
  const style = { width: size, height: size }
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt=""
        style={style}
        referrerPolicy="no-referrer"
        className="rounded-full object-cover shrink-0 bg-[var(--md-surface-container-highest)]"
      />
    )
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.4 }}
      className="rounded-full shrink-0 flex items-center justify-center bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-bold"
    >
      {initial}
    </span>
  )
}

/** Thẻ tài khoản (ảnh, tên, email) kèm nút Đăng xuất có xác nhận. */
export default function UserCard({ compact = false }) {
  const { user, signOut } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success(t('auth.loggedOut'))
    } catch (err) {
      toast.error(t('toast.error'))
      throw err
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        <Avatar user={user} size={compact ? 36 : 52} />
        <div className="min-w-0 flex-1 basis-40">
          <p className="text-base font-bold text-[var(--md-on-surface)] truncate">{user?.displayName || user?.email}</p>
          {user?.displayName && <p className="text-sm text-[var(--md-on-surface-variant)] truncate">{user.email}</p>}
        </div>
        <Button
          variant="warning"
          icon={LogOut}
          onClick={() => setConfirmOpen(true)}
          aria-label={t('auth.logout')}
          className="shrink-0"
        >
          {!compact && t('auth.logout')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSignOut}
        title={t('auth.logoutTitle')}
        body={t('auth.logoutBody')}
        confirmLabel={t('auth.logout')}
        confirmIcon={LogOut}
        tone="warning"
      />
    </>
  )
}
