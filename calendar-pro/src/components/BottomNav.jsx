import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

/** Thanh điều hướng dưới (di động): đường kẻ mảnh phía trên, tab đang chọn có vạch 2px và chữ đậm hơn. */
export default function BottomNav() {
  const { t } = useTranslation()
  const ITEMS = [
    { to: '/', label: t('nav.home'), icon: 'home' },
    { to: '/lich', label: t('nav.calendar'), icon: 'calendar_month' },
    { to: '/van-nien', label: t('nav.vanNien'), icon: 'auto_stories' },
    { to: '/dem-nguoc', label: t('nav.countdown'), icon: 'hourglass_top' }
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-outline-variant bg-card pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label={t('nav.menu')}
    >
      {ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="focus-ring group state relative flex h-16 flex-1 flex-col items-center justify-center gap-1 [@media(max-height:480px)]:h-12 [@media(max-height:480px)]:gap-0"
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-primary" aria-hidden="true" />}
              <span className={isActive ? 'text-primary' : 'text-ink-soft'}>
                <Icon name={icon} size={24} weight={isActive ? 400 : 300} />
              </span>
              <span className={`text-label-sm ${isActive ? 'text-primary' : 'text-ink-soft'}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
