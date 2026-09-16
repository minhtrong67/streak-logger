import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Search, Menu, Flame } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Breadcrumb from "./Breadcrumb";
import ThemeSwitcher from "./ThemeSwitcher";
import OfflineBanner from "./OfflineBanner";
import CommandPalette from "./CommandPalette";
import { useLang } from "../context/LangContext";

const COLLAPSE_KEY = "streak-dashboard:sidebarCollapsed";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "true",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const { t } = useLang();

  const openCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
  };

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh bg-[var(--color-bg)]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <OfflineBanner />

        {/* Mobile header: sidebar toggle + app name (left), search + theme (right). */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-2.5 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t("common.expand")}
              className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-control)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors shrink-0"
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-primary)] text-white shrink-0">
                <Flame size={14} />
              </span>
              <p className="font-semibold text-sm text-[var(--color-ink)] truncate">
                {t("app.name")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openCommandPalette}
              title={t("common.openCommandPalette")}
              aria-label={t("common.quickSearch")}
              className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
            >
              <Search size={16} />
            </button>
            <ThemeSwitcher iconOnly />
          </div>
        </header>

        {/* Desktop header: breadcrumb (left), quick search + theme (right). */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between gap-3 px-6 py-3 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <Breadcrumb />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={openCommandPalette}
              title={t("common.openCommandPalette")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-xs text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
            >
              <Search size={14} />
              <span>{t("common.quickSearch")}</span>
              <kbd className="text-[10px] font-medium bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-1.5 py-0.5">
                Ctrl K
              </kbd>
            </button>
            <ThemeSwitcher />
          </div>
        </header>

        <main
          key={pathname}
          className="page-enter flex-1 px-4 sm:px-6 py-5 sm:py-6 pb-24 lg:pb-6 max-w-[1400px] w-full mx-auto"
        >
          <Outlet />
        </main>
        <footer className="hidden lg:block text-center text-xs text-[var(--color-ink-soft)] py-4">
          Streak Logger by minhtrong67 · built with Claude (Anthropic)
        </footer>
      </div>
      <BottomNav />
      <CommandPalette />
    </div>
  );
}
