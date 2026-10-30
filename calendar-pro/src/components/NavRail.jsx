import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Thanh điều hướng dọc gọn (rộng 80px) cho cỡ cửa sổ trung bình — máy tính bảng, điện thoại nằm ngang
 * (640–1023px). Dưới 640px dùng thanh dưới, từ 1024px dùng sidebar đầy đủ.
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
      className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-outline-variant bg-card py-4 pl-[env(safe-area-inset-left)] no-scrollbar sm:flex lg:hidden"
      aria-label={t('nav.menu')}
    >
      <button
        onClick={onOpenSearch}
        className="state focus-ring mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-ink-soft"
        aria-label={t('header.search')}
      >
        <Icon name="search" size={22} />
      </button>

      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="focus-ring flex w-[4.25rem] flex-col items-center gap-1 rounded-lg py-1.5">
            {({ isActive }) => (
              <>
                <span
                  className={`state flex h-9 w-12 items-center justify-center rounded-lg transition-colors duration-150 ${
                    isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-ink-soft'
                  }`}
                >
                  <Icon name={icon} size={24} weight={isActive ? 400 : 300} />
                </span>
                <span className={`max-w-full truncate text-label-sm ${isActive ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
