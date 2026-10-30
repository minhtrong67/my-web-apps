import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { AppearanceProvider } from './context/AppearanceContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import BrandMark from './components/BrandMark'
import { SkeletonCard } from './components/ui/Skeleton'
import TimeStreaks from './pages/TimeStreaks'
import StreakPosts from './pages/StreakPosts'

// Trang thống kê chứa thư viện biểu đồ nặng nên chỉ tải khi người dùng mở trang.
const Statistics = lazy(() => import('./pages/Statistics'))
const Settings = lazy(() => import('./pages/Settings'))

/**
 * Màn hình chờ trong lúc Firebase xác định phiên đăng nhập. Dùng đúng màu nền của
 * giao diện đang chọn (trắng hoặc gần đen) và giống #boot trong index.html,
 * nên chuyển tiếp liền mạch từ splash sang ứng dụng.
 */
function AuthLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--md-surface)]">
      <div className="pulse-soft">
        <BrandMark size={72} />
      </div>
    </div>
  )
}

function PageFallback() {
  return <SkeletonCard className="max-w-xl" />
}

/** Chỉ hiện ứng dụng khi đã đăng nhập, ngược lại hiện màn hình đăng nhập. */
function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoading />
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/time-streaks" replace />} />
        <Route path="/time-streaks" element={<TimeStreaks />} />
        <Route path="/streak-posts" element={<StreakPosts />} />
        <Route
          path="/statistics"
          element={
            <Suspense fallback={<PageFallback />}>
              <Statistics />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LangProvider>
      <ThemeProvider>
        <AppearanceProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </LangProvider>
  )
}
