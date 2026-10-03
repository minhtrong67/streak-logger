import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useLang } from '../../context/LangContext'

export default function CopyButton({ text, label, className = '' }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || t('common.copy')}
      title={label || t('common.copy')}
      className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-colors duration-150 ${
        copied
          ? 'text-[var(--color-success)]'
          : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
      } ${className}`}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  )
}
