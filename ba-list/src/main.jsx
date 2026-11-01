import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider, ToastProvider } from './lib/app-context.jsx'

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
        <App />
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
)

/* Service worker (offline) – chỉ bật ở bản build */
if ('serviceWorker' in navigator && import.meta.env.PROD && /^https?:$/.test(location.protocol)) {
  addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}))
}
