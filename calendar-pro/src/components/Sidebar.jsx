import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTranslation } from '../i18n/useTranslation'

/**
 * Sidebar — mục điều hướng cao 40px, mục đang chọn tô xám nhạt + chữ đậm hơn.
 * Dùng cho desktop (lg:flex) và ngăn kéo menu trên di động.
 */
export default function Sidebar({ onNavigate, onOpenSearch, className = '' }) {
  const { t } = useTranslation()
  const ITEMS = [
    { to: '/', label: t('nav.home'), icon: 'home' },
    { to: '/lich', label: t('nav.calendarFull'), icon: 'calendar_month' },
    { to: '/van-nien', label: t('nav.vanNienFull'), icon: 'auto_stories' },
    { to: '/dem-nguoc', label: t('nav.countdownFull'), icon: 'hourglass_top' },
    { to: '/cai-dat', label: t('nav.settings'), icon: 'settings' }
  ]

  return (
    <aside className={className}>
      <div className="mb-6 flex items-center gap-3 px-3 pt-2">
        <img src="/icons/icon-192.png" alt="" className="h-9 w-9 shrink-0 rounded-[10px]" />
        <div className="min-w-0">
          <p className="text-title-md font-semibold leading-tight tracking-tight text-ink">{t('app.name')}</p>
          <p className="truncate text-body-sm text-ink-soft">{t('app.tagline')}</p>
        </div>
      </div>

      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="state focus-ring mb-4 flex h-10 items-center gap-2.5 rounded-lg border border-outline-variant px-3 text-left text-body-md text-ink-soft"
        >
          <Icon name="search" size={20} />
          <span className="flex-1">{t('header.search')}</span>
          <kbd className="rounded border border-outline-variant px-1.5 py-0.5 text-label-sm text-ink-faint">Ctrl K</kbd>
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-0.5" aria-label={t('nav.menu')}>
        {ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `state focus-ring flex h-10 items-center gap-3 rounded-lg px-3 text-label-lg ${
                isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-ink-soft'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={icon} size={22} weight={isActive ? 400 : 300} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <p className="mt-4 px-3 text-label-sm text-ink-faint">{t('app.credit')}</p>
    </aside>
  )
}
