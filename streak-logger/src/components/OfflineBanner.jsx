import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useLang } from '../context/LangContext'

/** Banner ngoại tuyến: chỉ hiện khi mất mạng, tự ẩn khi có mạng lại (không dùng toast). */
export default function OfflineBanner() {
  const { t } = useLang()
  const [online, setOnline] = useState(navigator.onLine)

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

  if (online) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)] text-xs font-semibold px-4 py-2.5 anim-pop">
      <WifiOff size={15} />
      {t('common.offline')}
    </div>
  )
}
