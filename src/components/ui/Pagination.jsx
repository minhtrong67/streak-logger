import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../../context/LangContext'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const { t } = useLang()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  if (total === 0) return null

  // Compact page-number list: always show first, last, current ±1, with
  // ellipses for gaps: keeps the control usable even with many pages.
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <p className="text-xs text-[var(--color-ink-soft)] order-2 sm:order-1">
        {t('common.showingRange', { from, to, total })}
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          aria-label={t('common.prevPage')}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="w-8 h-8 inline-flex items-center justify-center text-xs text-[var(--color-ink-soft)]">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-medium tabular transition-colors ${
                p === page
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label={t('common.nextPage')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
