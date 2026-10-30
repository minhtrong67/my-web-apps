import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useLang } from '../context/LangContext'
import BrandMark from './BrandMark'

const ROUTE_KEYS = {
  '/time-streaks': 'nav.timeStreaks',
  '/streak-posts': 'nav.streakPosts',
  '/statistics': 'nav.statistics',
  '/settings': 'nav.settings',
}

export default function Breadcrumb() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const key = ROUTE_KEYS[pathname]

  return (
    <div className="flex items-center gap-2 text-sm min-w-0">
      <BrandMark size={24} />
      <span className="text-[var(--md-on-surface-variant)] font-medium">{t('app.name')}</span>
      {key && (
        <>
          <ChevronRight size={16} className="text-[var(--md-on-surface-variant)] shrink-0" />
          <span className="font-bold text-[var(--md-on-surface)] truncate">{t(key)}</span>
        </>
      )}
    </div>
  )
}
