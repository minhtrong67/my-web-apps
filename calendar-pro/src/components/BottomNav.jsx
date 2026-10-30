import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thanh điều hướng dưới (di động) kiểu "floating" của Expressive: viên thuốc nổi cách mép, nền tonal;
 * mục đang chọn có chỉ báo 64×32 bung ngang bằng spring, icon đặc và nhích lên.
 */
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
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 flex items-stretch justify-around rounded-[32px] bg-surface-high px-2 shadow-elevated sm:hidden"
      aria-label={t('nav.menu')}
    >
      {ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="focus-ring group relative flex h-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-3xl [@media(max-height:480px)]:h-14 [@media(max-height:480px)]:gap-0"
        >
          {({ isActive }) => (
            <>
              <span className="relative flex h-8 w-16 items-center justify-center">
                <span className="nav-indicator absolute inset-0 rounded-full bg-secondary-container" data-active={isActive} />
                <span className={`state relative flex h-8 w-16 items-center justify-center rounded-full ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                  <Icon name={icon} size={24} filled={isActive} weight={isActive ? 500 : 400} className="nav-icon" />
                </span>
              </span>
              <span className={`text-label-md ${isActive ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
