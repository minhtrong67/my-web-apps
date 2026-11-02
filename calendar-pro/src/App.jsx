import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import { PageSkeleton } from './components/Skeleton'

// Trang đầu (Home) tải ngay để hiển thị nhanh nhất; các trang còn lại tách chunk riêng
// và được nạp sẵn lúc trình duyệt rảnh, nên chuyển trang vẫn gần như tức thì.
const loaders = {
  calendar: () => import('./pages/CalendarPage'),
  vanNien: () => import('./pages/VanNienPage'),
  countdown: () => import('./pages/CountdownPage'),
  settings: () => import('./pages/SettingsPage'),
  notFound: () => import('./pages/NotFoundPage')
}
const CalendarPage = lazy(loaders.calendar)
const VanNienPage = lazy(loaders.vanNien)
const CountdownPage = lazy(loaders.countdown)
const SettingsPage = lazy(loaders.settings)
const NotFoundPage = lazy(loaders.notFound)

if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200))
  idle(() => Object.values(loaders).forEach((load) => load()))
}

export default function App() {
  // Gỡ CSS màn hình chờ CHỈ SAU KHI React đã vẽ xong lần đầu (useEffect chạy sau commit).
  // Trước đây gỡ ngay sau root.render() — lúc đó React chưa thay màn hình chờ nên logo SVG mất kích thước và phóng to toàn màn hình.
  useEffect(() => {
    const id = requestAnimationFrame(() => document.getElementById('boot-style')?.remove())
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/lich" element={<Suspense fallback={<PageSkeleton />}><CalendarPage /></Suspense>} />
        <Route path="/van-nien" element={<Suspense fallback={<PageSkeleton />}><VanNienPage /></Suspense>} />
        <Route path="/dem-nguoc" element={<Suspense fallback={<PageSkeleton />}><CountdownPage /></Suspense>} />
        <Route path="/cai-dat" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFoundPage /></Suspense>} />
      </Route>
    </Routes>
  )
}
