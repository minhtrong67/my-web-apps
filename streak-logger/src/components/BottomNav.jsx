import { NavLink } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { NAV_ITEMS } from '../utils/nav'

function BottomNavLink({ to, label, Icon }) {
  return (
    <NavLink to={to} className="m3-ripple flex flex-col items-center justify-center gap-1 pt-3 pb-4 text-xs font-semibold group">
      {({ isActive }) => (
        <>
          <span
            className={`flex items-center justify-center h-8 rounded-full transition-all duration-500 ease-[var(--ease-spring)] ${
              isActive
                ? 'w-16 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                : 'w-8 text-[var(--md-on-surface-variant)] group-active:w-12 group-active:bg-[var(--md-surface-container-highest)]'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} className={isActive ? 'anim-pop' : ''} />
          </span>
          <span
            className={`truncate max-w-[5rem] transition-colors ${
              isActive ? 'text-[var(--md-on-surface)]' : 'text-[var(--md-on-surface-variant)]'
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

/** Thanh điều hướng dưới cùng trên mobile (Material 3 navigation bar) với chỉ báo dạng viên thuốc. */
export default function BottomNav() {
  const { t } = useLang()
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--md-surface-container)] pb-[env(safe-area-inset-bottom)]"
      aria-label={t('common.mainNavigation')}
    >
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map(({ to, key, icon }) => (
          <BottomNavLink key={to} to={to} label={t(`nav.short.${key}`)} Icon={icon} />
        ))}
      </div>
    </nav>
  )
}
