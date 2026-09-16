import { useLocation } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { useLang } from '../context/LangContext'

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
    <div className="flex items-center gap-1.5 text-sm min-w-0">
      <LayoutGrid size={15} className="text-[var(--color-ink-soft)] shrink-0" />
      <span className="text-[var(--color-ink-soft)] hidden sm:inline">{t('app.name')}</span>
      {key && (
        <>
          <ChevronRight size={14} className="text-[var(--color-ink-soft)] shrink-0 hidden sm:inline" />
          <span className="font-medium text-[var(--color-ink)] truncate">{t(key)}</span>
        </>
      )}
    </div>
  )
}
