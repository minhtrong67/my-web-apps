import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import { PanelLeftClose, PanelLeft, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'
import { NAV_ITEMS } from '../utils/nav'
import { Avatar } from './UserCard'

function SidebarLink({ to, label, Icon, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={({ isActive }) =>
        `m3-ripple group flex items-center gap-3 h-14 rounded-full text-sm font-semibold transition-[background-color,color,padding] duration-300 ease-[var(--ease-emphasized)] ${
          collapsed ? 'justify-center px-0' : 'px-5'
        } ${
          isActive
            ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
            : 'text-[var(--md-on-surface-variant)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={22}
            strokeWidth={isActive ? 2.4 : 1.9}
            className="shrink-0 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110"
          />
          <span className={collapsed ? 'hidden' : 'truncate'}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function Brand({ collapsed }) {
  const { t } = useLang()
  return (
    <div className={`flex items-center py-6 ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}>
      <BrandMark size={44} className="anim-float" />
      <div className={`leading-tight min-w-0 ${collapsed ? 'hidden' : ''}`}>
        <p className="font-bold text-lg tracking-tight text-[var(--md-on-surface)] truncate">{t('app.name')}</p>
        <p className="text-xs text-[var(--md-on-surface-variant)] truncate">{t('app.tagline')}</p>
      </div>
    </div>
  )
}

function NavList({ collapsed, onLinkClick }) {
  const { t } = useLang()
  return (
    <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden" aria-label={t('common.mainNavigation')}>
      {NAV_ITEMS.map(({ to, key, icon }) => (
        <SidebarLink key={to} to={to} label={t(`nav.${key}`)} Icon={icon} collapsed={collapsed} onClick={onLinkClick} />
      ))}
    </nav>
  )
}

/** Khối người dùng (ảnh và tên) ở chân sidebar. */
function SidebarUser({ collapsed }) {
  const { user } = useAuth()
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center px-0' : ''}`}>
        <Avatar user={user} size={36} />
        <p className={`min-w-0 text-sm font-semibold text-[var(--md-on-surface)] truncate ${collapsed ? 'hidden' : ''}`}>
          {user?.displayName || user?.email}
        </p>
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { t } = useLang()

  // Nhấn Escape để đóng drawer trên mobile.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && onCloseMobile()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {/* Navigation drawer / rail trên desktop, thu gọn được. */}
      <aside
        className={`hidden lg:flex sticky top-0 z-0 h-dvh shrink-0 bg-[var(--md-surface)] flex-col transition-[width] duration-[350ms] ease-[var(--ease-emphasized)] ${
          collapsed ? 'w-[88px]' : 'w-[296px]'
        }`}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="px-3 pb-4 pt-3 mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`m3-ripple flex w-full items-center gap-3 h-12 rounded-full text-sm font-semibold text-[var(--md-on-surface-variant)] ${
              collapsed ? 'justify-center px-0' : 'px-5'
            }`}
            title={collapsed ? t('common.expand') : t('common.collapse')}
            aria-label={collapsed ? t('common.expand') : t('common.collapse')}
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            <span className={collapsed ? 'hidden' : ''}>{t('common.collapse')}</span>
          </button>
          <SidebarUser collapsed={collapsed} />
        </div>
      </aside>

      {/*
        Drawer mobile (modal navigation drawer): luôn nằm trong DOM để trượt vào/ra bằng transform.
        `inert` chặn focus và bấm nhầm khi đang đóng.
      */}
      <div className={`lg:hidden fixed inset-0 z-[80] ${mobileOpen ? '' : 'pointer-events-none'}`} inert={!mobileOpen}>
        <div
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-[var(--md-surface-container-low)] rounded-r-[28px] flex flex-col pt-[env(safe-area-inset-top)] will-change-transform transition-transform duration-[400ms] ease-[var(--ease-emphasized)] ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pr-3">
            <Brand collapsed={false} />
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={t('common.closeMenu')}
              className="m3-ripple morph w-10 h-10 inline-flex items-center justify-center rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)]"
            >
              <X size={20} />
            </button>
          </div>
          <NavList collapsed={false} onLinkClick={onCloseMobile} />
          <div className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <SidebarUser collapsed={false} />
          </div>
        </aside>
      </div>
    </>
  )
}
