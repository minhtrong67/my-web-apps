import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Search, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import PageTitle from './PageTitle'
import ThemeSwitcher from './ThemeSwitcher'
import OfflineBanner from './OfflineBanner'
import CommandPalette from './CommandPalette'
import ScrollToTopButton from './ui/ScrollToTopButton'
import { useLang } from '../context/LangContext'
import { useScrolledPast } from '../hooks/useScrollPosition'

const COLLAPSE_KEY = 'streak-logger:sidebarCollapsed'

/** Khung giao diện chính: sidebar + thanh tiêu đề + nội dung + thanh điều hướng dưới (mobile). */
export default function Layout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { pathname } = useLocation()
  const { t } = useLang()
  const scrolled = useScrolledPast(4)

  // Mở CommandPalette bằng cách phát phím tắt Ctrl+K (component palette đang lắng nghe phím này).
  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
  }

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, String(next))
      return next
    })
  }

  // Thanh tiêu đề đổi sang nền tonal khi nội dung cuộn dưới nó (top app bar on scroll).
  const barBg = scrolled ? 'bg-[var(--md-surface-container)]' : 'bg-[var(--md-surface)]'

  return (
    <div className="flex min-h-dvh bg-[var(--md-surface)]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <OfflineBanner />

        {/* Header mobile: nút mở menu + tên trang đang xem (trái), tìm kiếm + giao diện (phải). */}
        <header
          className={`lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] transition-colors duration-300 ${barBg}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t('common.openMenu')}
              className="m3-ripple morph flex items-center justify-center w-10 h-10 rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)] shrink-0"
            >
              <Menu size={22} />
            </button>
            <PageTitle compact />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openCommandPalette}
              title={t('common.openCommandPalette')}
              aria-label={t('common.quickSearch')}
              className="m3-ripple morph flex items-center justify-center w-10 h-10 rounded-full active:rounded-[12px] bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]"
            >
              <Search size={18} />
            </button>
            <ThemeSwitcher iconOnly />
          </div>
        </header>

        {/* Header desktop */}
        <header
          className={`hidden lg:flex sticky top-0 z-30 items-center justify-between gap-3 px-8 py-3 transition-colors duration-300 ${barBg}`}
        >
          <PageTitle />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openCommandPalette}
              title={t('common.openCommandPalette')}
              className="m3-ripple morph inline-flex items-center gap-2 h-10 px-4 rounded-[20px] active:rounded-[10px] bg-[var(--md-surface-container-highest)] text-sm font-semibold text-[var(--md-on-surface-variant)]"
            >
              <Search size={16} />
              <span>{t('common.quickSearch')}</span>
              <kbd className="text-[10px] font-bold rounded-md px-1.5 py-0.5 bg-[var(--md-surface)] text-[var(--md-on-surface-variant)]">Ctrl K</kbd>
            </button>
            <ThemeSwitcher />
          </div>
        </header>

        <main key={pathname} className="page-enter flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 lg:pb-10 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <CommandPalette />
      <ScrollToTopButton />
    </div>
  )
}
