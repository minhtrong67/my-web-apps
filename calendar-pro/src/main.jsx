import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { SettingsProvider } from './contexts/SettingsContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import './index.css'
import { initRipple } from './lib/ripple.js'

initRipple()

// Hiện icon khi font Material Symbols đã sẵn sàng (hoặc sau tối đa 2.5s) — tránh nhấp nháy chữ ligature
const showIcons = () => document.documentElement.classList.add('icons-ready')
if (document.fonts?.load) {
  Promise.race([
    document.fonts.load("24px 'Material Symbols Outlined'"),
    new Promise((resolve) => setTimeout(resolve, 2500))
  ]).finally(showIcons)
} else {
  showIcons()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ToastProvider>
    </SettingsProvider>
  </React.StrictMode>
)

// React đã thay màn hình chờ trong #root bằng giao diện thật; CSS của app đã nắm nền → gỡ CSS khởi động
requestAnimationFrame(() => document.getElementById('boot-style')?.remove())
