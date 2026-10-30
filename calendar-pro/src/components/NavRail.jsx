import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Navigation rail Expressive (rộng 96px) cho cỡ cửa sổ trung bình — máy tính bảng, điện thoại nằm ngang
 * (640–1023px). Dưới 640px dùng thanh dưới, từ 1024px dùng sidebar đầy đủ. Chỉ báo 56×32 bung ngang bằng spring.
 */
export default function NavRail({ onOpenSearch }) {
  const { t } = useTranslation()
  const ITEMS = [
    { to: '/', label: t('nav.home'), icon: 'home' },
    { to: '/lich', label: t('nav.calendar'), icon: 'calendar_month' },
    { to: '/van-nien', label: t('nav.vanNien'), icon: 'auto_stories' },
    { to: '/dem-nguoc', label: t('nav.countdown'), icon: 'hourglass_top' },
    { to: '/cai-dat', label: t('nav.settings'), icon: 'settings' }
  ]

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-24 shrink-0 flex-col items-center gap-2 overflow-y-auto rounded-r-[28px] bg-surface-low py-5 pl-[env(safe-area-inset-left)] no-scrollbar sm:flex lg:hidden"
      aria-label={t('nav.menu')}
    >
      <button
        onClick={onOpenSearch}
        className="state morph focus-ring mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tertiary-container text-on-tertiary-container"
        aria-label={t('header.search')}
      >
        <Icon name="search" size={26} />
      </button>

      <nav className="flex flex-col gap-3">
        {ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="focus-ring group flex w-[5rem] flex-col items-center gap-1 rounded-2xl py-1">
            {({ isActive }) => (
              <>
                <span className="relative flex h-8 w-14 items-center justify-center">
                  <span className="nav-indicator absolute inset-0 rounded-full bg-secondary-container" data-active={isActive} />
                  <span className={`state relative flex h-8 w-14 items-center justify-center rounded-full ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                    <Icon name={icon} size={24} filled={isActive} weight={isActive ? 500 : 400} className="nav-icon" />
                  </span>
                </span>
                <span className={`max-w-full truncate text-label-md ${isActive ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
