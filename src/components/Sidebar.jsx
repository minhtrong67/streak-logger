import { NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import { PanelLeftClose, PanelLeft, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { useRipple, RippleLayer } from '../hooks/useRipple'
import BrandMark from './BrandMark'
import { NAV_ITEMS } from '../utils/nav'
import { Avatar } from './UserCard'

function SidebarLink({ to, label, Icon, collapsed, onClick }) {
  const { ripples, onPointerDown } = useRipple()
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          isActive
            ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-sm'
            : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <RippleLayer ripples={ripples} tone={isActive ? 'light' : 'dark'} />
          <Icon size={18} className="shrink-0 transition-transform duration-150 group-hover:scale-110" />
          <span className={collapsed ? 'hidden' : ''}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function Brand({ collapsed }) {
  const { t } = useLang()
  return (
    <div className={`flex items-center px-5 py-5 ${collapsed ? 'justify-center px-0' : 'gap-2.5'}`}>
      <BrandMark />
      <div className={`leading-tight min-w-0 ${collapsed ? 'hidden' : ''}`}>
        <p className="font-semibold text-sm text-[var(--color-ink)] truncate">{t('app.name')}</p>
        <p className="text-xs text-[var(--color-ink-soft)] truncate">{t('app.tagline')}</p>
      </div>
    </div>
  )
}

function NavList({ collapsed, onLinkClick }) {
  const { t } = useLang()
  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
      {NAV_ITEMS.map(({ to, key, icon }) => (
        <SidebarLink key={to} to={to} label={t(`nav.${key}`)} Icon={icon} collapsed={collapsed} onClick={onLinkClick} />
      ))}
    </nav>
  )
}

/** Khối người dùng ở chân sidebar. */
function SidebarUser({ collapsed }) {
  const { user } = useAuth()
  const { t } = useLang()
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? 'justify-center px-0' : ''}`}>
      <Avatar user={user} size={32} />
      <div className={`min-w-0 ${collapsed ? 'hidden' : ''}`}>
        <p className="text-xs font-medium text-[var(--color-ink)] truncate">{user?.displayName || user?.email}</p>
        <p className="text-[11px] text-[var(--color-ink-soft)] truncate">{t('app.creditShort')}</p>
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { t } = useLang()

  // Nhấn Escape để đóng drawer trên mobile.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && onCloseMobile()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {/* Sidebar desktop: nền violet nhạt để dễ nhận biết, có thể thu gọn. */}
      <aside
        className={`hidden lg:flex sticky top-0 z-0 h-dvh shrink-0 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex-col transition-[width] duration-[250ms] ${
          collapsed ? 'w-20' : 'w-[272px]'
        }`}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="px-3 pb-4 pt-3 border-t border-[var(--color-border)] mt-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)] transition-all duration-150 active:scale-[0.98] mb-1 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? t('common.expand') : t('common.collapse')}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            <span className={collapsed ? 'hidden' : ''}>{t('common.collapse')}</span>
          </button>
          <SidebarUser collapsed={collapsed} />
        </div>
      </aside>

      {/*
        Drawer mobile: luôn nằm trong DOM để có thể trượt vào và trượt ra bằng transform.
        Đóng thì đẩy sang trái ngoài màn hình (-translate-x-full), mở thì về vị trí 0.
        `inert` ngăn focus và bấm nhầm vào drawer khi đang đóng.
      */}
      <div
        className={`lg:hidden fixed inset-0 z-[80] ${mobileOpen ? '' : 'pointer-events-none'}`}
        inert={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-[var(--color-sidebar)] border-r border-[var(--color-border)] flex flex-col pt-[env(safe-area-inset-top)] will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileOpen ? 'translate-x-0 shadow-[var(--shadow-modal)]' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pr-2">
            <Brand collapsed={false} />
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={t('common.close')}
              className="rounded-lg p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)]"
            >
              <X size={18} />
            </button>
          </div>
          <NavList collapsed={false} onLinkClick={onCloseMobile} />
          <div className="border-t border-[var(--color-border)] mt-2 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <SidebarUser collapsed={false} />
          </div>
        </aside>
      </div>
    </>
  )
}
