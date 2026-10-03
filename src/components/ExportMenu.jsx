import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileImage, FileJson, FileSpreadsheet, FileText, FileType, FileDown } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { EXPORT_FORMATS } from '../utils/exportData'

const FORMAT_ICONS = {
  csv: FileText,
  json: FileJson,
  excel: FileSpreadsheet,
  word: FileType,
  pdf: FileDown,
  png: FileImage,
}

/**
 * Nút "Xuất" mở menu chọn định dạng (CSV, JSON, Excel, Word, PDF, PNG).
 * `onExport(format)` có thể là async: nút sẽ hiện trạng thái đang xử lý và bị
 * vô hiệu hóa cho tới khi xuất xong, tránh bấm nhiều lần.
 */
export default function ExportMenu({
  onExport,
  formats = EXPORT_FORMATS,
  variant = 'outline',
  label,
  disabled = false,
  className = '',
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  // Đóng menu khi bấm ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleSelect = async (format) => {
    setOpen(false)
    setBusy(true)
    try {
      await onExport(format)
    } finally {
      setBusy(false)
    }
  }

  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] hover:brightness-105 shadow-sm border border-transparent'
      : 'border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={busy || undefined}
        className={`w-full justify-center inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-[var(--radius-control)] transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap ${styles}`}
      >
        {busy ? <Loader2 size={16} className="shrink-0 animate-spin" /> : <Download size={16} className="shrink-0" />}
        <span>{busy ? t('common.exporting') : label || t('common.export')}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="stagger-item absolute right-0 top-full mt-2 z-30 w-52 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] p-1.5 flex flex-col"
        >
          {formats.map((key) => {
            const Icon = FORMAT_ICONS[key]
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(key)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors text-left"
              >
                <Icon size={16} className="shrink-0" />
                {t(`common.exportFormats.${key}`)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
