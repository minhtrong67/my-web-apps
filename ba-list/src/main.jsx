import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BootScreen } from './components/Loading.jsx'
import { SettingsProvider, ToastProvider } from './lib/app-context.jsx'

/* App + dữ liệu học sinh nằm ở chunk riêng → hiện BootScreen (vòng halo + skeleton) trong lúc tải */
const App = lazy(() => import('./App.jsx'))

/* Giữ lại sự kiện cài đặt PWA để nút "Cài đặt ứng dụng" trong Cài đặt dùng */
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__bip = e
  dispatchEvent(new Event('bip'))
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <Suspense fallback={<BootScreen />}>
          <App />
        </Suspense>
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
)

/* Service worker (offline) – chỉ bật ở bản build */
if ('serviceWorker' in navigator && import.meta.env.PROD && /^https?:$/.test(location.protocol)) {
  addEventListener('load', () => navigator.serviceWorker.register(new URL('../sw.js', location.href).href).catch(() => {}))
}
