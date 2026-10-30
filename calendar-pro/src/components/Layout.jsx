import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import NavRail from './NavRail'
import Header from './Header'
import CommandPalette from './CommandPalette'
import Icon from './Icon'
import { useSettings } from '../contexts/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'
import { useReminders } from '../hooks/useReminders'
import { useExitTransition } from '../hooks/useExitTransition'
import { useModal } from '../hooks/useModal'

export default function Layout() {
  const location = useLocation()
  const { settings } = useSettings()
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const drawerRef = useRef(null)
  const { mounted: drawerMounted, closing: drawerClosing } = useExitTransition(drawerOpen, 240)
  useModal(drawerOpen, () => setDrawerOpen(false), drawerRef)

  useReminders(settings.notificationsEnabled, {
    notifyLunarDays: settings.notifyLunarDays,
    notifyHolidayIds: settings.notifyHolidayIds,
    notifyHour: settings.notifyHour,
    notifyMinute: settings.notifyMinute,
    notifyTiming: settings.notifyTiming,
    notifyBeforeDays: settings.notifyBeforeDays,
    lang: settings.language
  })

  // Mỗi lần chuyển trang: đóng ngăn kéo mobile và cuộn về đầu trang (tức thì, không cuộn mượt)
  useEffect(() => {
    setDrawerOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Phím tắt Ctrl/Cmd + K để mở bảng tìm kiếm menu ở bất kỳ đâu trong ứng dụng
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* Cỡ cửa sổ: <640 thanh dưới (+ menu trượt) · 640–1023 thanh dọc gọn · ≥1024 sidebar đầy đủ */}
      <NavRail onOpenSearch={() => setPaletteOpen(true)} />
      <Sidebar
        onOpenSearch={() => setPaletteOpen(true)}
        className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-outline-variant bg-card px-3 py-6 pl-[max(0.75rem,env(safe-area-inset-left))] lg:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 pb-24 sm:pb-12">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {drawerMounted &&
        createPortal(
          <div className="fixed inset-0 z-[75] flex sm:hidden" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
            <div className={`absolute inset-0 bg-black/40 ${drawerClosing ? 'scrim-out' : 'scrim-in'}`} onClick={() => setDrawerOpen(false)} />
            <div ref={drawerRef} tabIndex={-1} className={`${drawerClosing ? 'animate-drawer-left-out' : 'animate-drawer-left'} relative z-10 flex h-full w-[85vw] max-w-xs flex-col rounded-r-2xl border-r border-outline-variant bg-card px-3 py-6 shadow-elevated outline-none`}>
              <button
                onClick={() => setDrawerOpen(false)}
                className="state focus-ring absolute right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft"
                aria-label={t('nav.closeMenu')}
              >
                <Icon name="close" size={20} />
              </button>
              <div style={{ paddingTop: 'env(safe-area-inset-top)' }} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <Sidebar onNavigate={() => setDrawerOpen(false)} className="flex flex-1 flex-col" />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
