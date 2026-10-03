import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'

const options = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

/** Nút chuyển giao diện Sáng / Tối / Hệ thống. `iconOnly` dùng cho header mobile. */
export default function ThemeSwitcher({ iconOnly = false }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = options.find((o) => o.value === theme) || options[2]
  const CurrentIcon = current.icon

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={t(`theme.${current.value}`)}
        aria-label={t(`theme.${current.value}`)}
        className={
          iconOnly
            ? 'flex items-center justify-center w-9 h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors'
            : 'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors'
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CurrentIcon size={iconOnly ? 17 : 16} />
        {!iconOnly && <span>{t(`theme.${current.value}`)}</span>}
        {!iconOnly && <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="stagger-item absolute right-0 mt-1.5 w-40 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] p-1.5 z-40">
          {options.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                theme === value
                  ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <Icon size={16} />
              {t(`theme.${value}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
