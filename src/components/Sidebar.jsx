import { NavLink } from "react-router-dom";
import {
  Clock,
  NotebookText,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { useRipple, RippleLayer } from "../hooks/useRipple";

function SidebarLink({ to, label, Icon, collapsed, onClick }) {
  const { ripples, onPointerDown } = useRipple();
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onPointerDown={onPointerDown}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          collapsed ? "justify-center px-0" : ""
        } ${
          isActive
            ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
            : "text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <RippleLayer ripples={ripples} tone="dark" />
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[var(--color-primary)] animate-[fade-in_.2s_ease]" />
          )}
          <Icon
            size={18}
            className="shrink-0 transition-transform duration-150 group-hover:scale-110"
          />
          <span className={collapsed ? "hidden" : ""}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function Brand({ collapsed }) {
  const { t } = useLang();
  return (
    <div
      className={`flex items-center px-5 py-5 ${collapsed ? "justify-center px-0" : "gap-2.5"}`}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-primary)] text-white shrink-0 transition-transform duration-200 hover:scale-105">
        <Flame size={18} />
      </div>
      <div className={`leading-tight min-w-0 ${collapsed ? "hidden" : ""}`}>
        <p className="font-semibold text-sm text-[var(--color-ink)] truncate">
          {t("app.name")}
        </p>
        <p className="text-xs text-[var(--color-ink-soft)] truncate">
          {t("app.tagline")}
        </p>
      </div>
    </div>
  );
}

function NavList({ collapsed, onLinkClick }) {
  const { t } = useLang();
  const items = [
    { to: "/time-streaks", label: t("nav.timeStreaks"), icon: Clock },
    { to: "/streak-posts", label: t("nav.streakPosts"), icon: NotebookText },
    { to: "/statistics", label: t("nav.statistics"), icon: BarChart3 },
    { to: "/settings", label: t("nav.settings"), icon: SettingsIcon },
  ];
  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <SidebarLink
          key={to}
          to={to}
          label={label}
          Icon={Icon}
          collapsed={collapsed}
          onClick={onLinkClick}
        />
      ))}
    </nav>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { t } = useLang();

  return (
    <>
      {/* Desktop sidebar — fixed column, collapsible width. */}
      <aside
        className={`hidden lg:flex sticky top-0 z-0 h-dvh shrink-0 bg-[var(--color-surface-2)] border-r border-[var(--color-border)] flex-col transition-[width] duration-[250ms] ${
          collapsed ? "w-20" : "w-[272px]"
        }`}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="px-3 pb-4 pt-3 border-t border-[var(--color-border)] mt-2">
          <button
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)] transition-all duration-150 active:scale-[0.98] mb-1 ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? t("common.expand") : t("common.collapse")}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            <span className={collapsed ? "hidden" : ""}>
              {t("common.collapse")}
            </span>
          </button>
          <p
            className={`text-xs text-[var(--color-ink-soft)] px-3 ${collapsed ? "hidden" : ""}`}
          >
            gnort67 · Claude (Anthropic)
          </p>
        </div>
      </aside>

      {/* Mobile drawer — off-canvas panel opened from the mobile header's
          hamburger button. Bottom nav still covers primary navigation, this
          just mirrors the same list for the "toggle sidebar" requirement. */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/40 animate-[fade-in_.15s_ease]"
            onClick={onCloseMobile}
          />
          <aside className="absolute left-0 top-0 h-full w-[80%] max-w-[300px] bg-[var(--color-surface-2)] border-r border-[var(--color-border)] flex flex-col animate-[modal-in_.2s_cubic-bezier(.2,.8,.2,1)]">
            <div className="flex items-center justify-between pr-2">
              <Brand collapsed={false} />
              <button
                onClick={onCloseMobile}
                aria-label={t("common.close")}
                className="rounded-lg p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-ink)]"
              >
                <X size={18} />
              </button>
            </div>
            <NavList collapsed={false} onLinkClick={onCloseMobile} />
            <p className="text-xs text-[var(--color-ink-soft)] px-6 pb-4 pt-3 border-t border-[var(--color-border)] mt-2">
              gnort67 · Claude (Anthropic)
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
