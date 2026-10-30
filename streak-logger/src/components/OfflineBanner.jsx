import { useEffect, useRef, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

/** Banner ngoại tuyến, kèm toast cảnh báo khi mất mạng và toast thành công khi có mạng trở lại. */
export default function OfflineBanner() {
  const { t } = useLang()
  const toast = useToast()
  const [online, setOnline] = useState(navigator.onLine)
  const first = useRef(true)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Bỏ qua lần chạy đầu tiên để không báo khi vừa mở ứng dụng.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (online) toast.success(t('toast.online'))
    else toast.warning(t('toast.offline'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online])

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)] text-xs font-semibold px-4 py-2.5 anim-pop">
      <WifiOff size={15} />
      {t('common.offline')}
    </div>
  )
}
