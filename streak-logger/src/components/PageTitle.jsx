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
    <div key={pathname} className="anim-pop flex items-center gap-3 min-w-0">
      <span
        className={`shrink-0 flex items-center justify-center bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ${
          compact ? 'w-9 h-9 rounded-[12px]' : 'w-10 h-10 rounded-[14px]'
        }`}
      >
        <Icon size={compact ? 18 : 20} />
      </span>
      <h2 className={`font-bold tracking-tight text-[var(--md-on-surface)] truncate ${compact ? 'text-lg' : 'text-xl'}`}>
        {t(`nav.${item.key}`)}
      </h2>
    </div>
  )
}
