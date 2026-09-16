import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, NotebookText, BarChart3, Settings as SettingsIcon, CornerDownLeft } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function CommandPalette() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const pages = useMemo(
    () => [
      { to: '/time-streaks', label: t('nav.timeStreaks'), icon: Clock },
      { to: '/streak-posts', label: t('nav.streakPosts'), icon: NotebookText },
      { to: '/statistics', label: t('nav.statistics'), icon: BarChart3 },
      { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
    ],
    [t],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((p) => p.label.toLowerCase().includes(q))
  }, [pages, query])

  // Global Ctrl+K / Cmd+K shortcut, plus Escape to close.
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActiveIndex(0), [query])

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIndex]) {
      go(results[activeIndex].to)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4 bg-black/40 animate-[fade-in_.15s_ease]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="w-full max-w-md rounded-[var(--radius-modal)] glass-surface shadow-[var(--shadow-modal)] border border-[var(--color-border)] overflow-hidden animate-[modal-in_.18s_cubic-bezier(.2,.8,.2,1)]">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--color-border)]">
          <Search size={17} className="text-[var(--color-ink-soft)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('common.commandPalettePlaceholder')}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]"
          />
          <kbd className="hidden sm:inline text-[10px] font-medium text-[var(--color-ink-soft)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="text-center text-sm text-[var(--color-ink-soft)] py-6">{t('common.noPagesFound')}</p>
          )}
          {results.map(({ to, label, icon: Icon }, i) => (
            <button
              key={to}
              onClick={() => go(to)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                i === activeIndex ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {i === activeIndex && <CornerDownLeft size={13} className="shrink-0 opacity-70" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
