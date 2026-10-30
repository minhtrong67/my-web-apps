import { useCallback, useEffect, useState } from 'react'

/**
 * usePwaInstall — bắt sự kiện 'beforeinstallprompt' để hiển thị nút cài đặt PWA tuỳ biến,
 * và phát hiện khi ứng dụng đã được cài đặt (chạy ở chế độ standalone) để ẩn thẻ cài đặt đi.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    function onInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable'
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') setInstalled(true)
    return outcome
  }, [deferredPrompt])

  return { canInstall: !!deferredPrompt && !installed, installed, promptInstall }
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone === true
}
