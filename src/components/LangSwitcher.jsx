import { useEffect, useRef, useState } from 'react'
import { Languages, ChevronDown } from 'lucide-react'
import { useLang } from '../context/LangContext'

export default function LangSwitcher() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Languages size={16} />
        <span className="hidden sm:inline">{t(`lang.${lang}`)}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-1.5 z-20">
          {['en', 'vi'].map((code) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                lang === code ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'
              }`}
            >
              {t(`lang.${code}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
