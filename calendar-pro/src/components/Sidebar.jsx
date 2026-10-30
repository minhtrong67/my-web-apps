import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

const ITEM_H = 56 // h-14
const ITEM_GAP = 4 // gap-1

/**
 * Sidebar Expressive — mục cao 56px; chỉ báo "viên thuốc" màu secondary-container TRƯỢT giữa các mục bằng spring
 * (một phần tử duy nhất di chuyển, không phải mỗi mục tự đổi nền). Icon đặc (FILL 1) ở mục đang chọn.
 * Dùng cho desktop (lg:flex) và ngăn kéo menu trên di động.
 */
export default function Sidebar({ onNavigate, onOpenSearch, className = '' }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const ITEMS = [
    { to: '/', label: t('nav.home'), icon: 'home' },
    { to: '/lich', label: t('nav.calendarFull'), icon: 'calendar_month' },
    { to: '/van-nien', label: t('nav.vanNienFull'), icon: 'auto_stories' },
    { to: '/dem-nguoc', label: t('nav.countdownFull'), icon: 'hourglass_top' },
    { to: '/cai-dat', label: t('nav.settings'), icon: 'settings' }
  ]
  const activeIndex = ITEMS.findIndex(({ to }) => (to === '/' ? pathname === '/' : pathname.startsWith(to)))

  return (
    <aside className={className}>
      <div className="mb-6 flex items-center gap-3 px-3 pt-2">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <p className="text-title-lg leading-tight text-on-surface">{t('app.name')}</p>
          <p className="truncate text-body-sm text-on-surface-variant">{t('app.tagline')}</p>
        </div>
      </div>

      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="state morph focus-ring mb-5 flex h-14 items-center gap-3 rounded-full bg-surface-high px-5 text-left text-body-lg text-on-surface-variant"
        >
          <Icon name="search" size={24} />
          <span className="flex-1">{t('header.search')}</span>
          <kbd className="rounded-full bg-surface-highest px-2 py-0.5 text-label-sm text-on-surface-variant">Ctrl K</kbd>
        </button>
      )}

      <nav className="relative flex flex-1 flex-col content-start gap-1" style={{ flex: 'none' }} aria-label={t('nav.menu')}>
        {activeIndex > -1 && (
          <span
            aria-hidden="true"
            className="slide-indicator absolute left-0 top-0 h-14 w-full rounded-full bg-secondary-container"
            style={{ transform: `translateY(${activeIndex * (ITEM_H + ITEM_GAP)}px)` }}
          />
        )}
        {ITEMS.map(({ to, label, icon }, i) => {
          const active = i === activeIndex
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={`state morph-square focus-ring relative z-10 flex h-14 items-center gap-4 rounded-full px-5 text-label-lg transition-colors duration-effects ease-effects ${
                active ? 'text-on-secondary-container' : 'text-on-surface-variant'
              }`}
            >
              <Icon name={icon} size={24} filled={active} weight={active ? 500 : 400} />
              <span className={active ? 'font-bold' : ''}>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      <p className="mt-auto px-4 pt-6 text-label-sm text-on-surface-variant/70">{t('app.credit')}</p>
    </aside>
  )
}
