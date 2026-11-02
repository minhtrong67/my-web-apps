import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BootScreen } from './components/Loading.jsx'
import { loadFont, normalizeFont } from './lib/fonts.js'
import { SettingsProvider, ToastProvider } from './lib/app-context.jsx'

/* App + dữ liệu học sinh nằm ở chunk riêng → hiện BootScreen (vòng halo + skeleton) trong lúc tải */
const savedFont = () => { try { return normalizeFont(JSON.parse(localStorage.getItem('ba-cfg') || '{}').ff) } catch { return 'system' } }
const App = lazy(() => Promise.all([import('./App.jsx'), loadFont(savedFont())]).then(([m]) => m))

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
