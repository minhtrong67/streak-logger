import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useLang } from '../context/LangContext'

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
    <div className="flex items-center justify-center gap-2 bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-xs font-medium px-4 py-2">
      <WifiOff size={14} />
      {t('common.offline')}
    </div>
  )
}
