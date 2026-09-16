import { NavLink } from 'react-router-dom'
import { Clock, NotebookText, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useRipple, RippleLayer } from '../hooks/useRipple'

function BottomNavLink({ to, label, Icon }) {
  const { ripples, onPointerDown } = useRipple()
  return (
    <NavLink
      to={to}
      onPointerDown={onPointerDown}
      className={({ isActive }) =>
        `relative overflow-hidden flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-150 active:scale-90 ${
          isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-soft)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <RippleLayer ripples={ripples} tone="dark" />
          <span className={`flex items-center justify-center w-9 h-6 rounded-full transition-all duration-200 ${isActive ? 'bg-[var(--color-primary-soft)] scale-105' : 'scale-100'}`}>
            <Icon size={18} />
          </span>
          <span className="truncate max-w-[4.5rem]">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav() {
  const { t } = useLang()

  const items = [
    { to: '/time-streaks', label: t('nav.short.timeStreaks'), icon: Clock },
    { to: '/streak-posts', label: t('nav.short.streakPosts'), icon: NotebookText },
    { to: '/statistics', label: t('nav.short.statistics'), icon: BarChart3 },
    { to: '/settings', label: t('nav.short.settings'), icon: SettingsIcon },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-surface border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <BottomNavLink key={to} to={to} label={label} Icon={Icon} />
        ))}
      </div>
    </nav>
  )
}
