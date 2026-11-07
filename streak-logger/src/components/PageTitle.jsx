import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { NAV_ITEMS } from '../utils/nav'

/** Tên trang đang xem (kèm biểu tượng của trang), hiển thị trên header thay cho logo và tên web. */
export default function PageTitle({ compact = false }) {
  const { t } = useLang()
  const { pathname } = useLocation()
  const item = NAV_ITEMS.find((n) => n.to === pathname)
  if (!item) return null
  const Icon = item.icon

  return (
    <div key={pathname} className="flex items-center gap-3 min-w-0">
      <h2 className={`font-bold tracking-tight text-[var(--md-on-surface)] truncate ${compact ? 'text-lg' : 'text-xl'}`}>
        {t(`nav.${item.key}`)}
      </h2>
    </div>
  )
}
