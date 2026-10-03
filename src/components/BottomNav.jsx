import { NavLink } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useRipple, RippleLayer } from '../hooks/useRipple'
import { NAV_ITEMS } from '../utils/nav'

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
          <span
            className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
              isActive ? 'bg-[var(--color-primary-soft)] scale-105' : 'scale-100'
            }`}
          >
            <Icon size={19} />
          </span>
          <span className="truncate max-w-[4.5rem]">{label}</span>
        </>
      )}
    </NavLink>
  )
}

/** Thanh điều hướng dưới cùng trên mobile, 4 tab truy cập nhanh. */
export default function BottomNav() {
  const { t } = useLang()
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-surface border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Điều hướng chính"
    >
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map(({ to, key, icon }) => (
          <BottomNavLink key={to} to={to} label={t(`nav.short.${key}`)} Icon={icon} />
        ))}
      </div>
    </nav>
  )
}
