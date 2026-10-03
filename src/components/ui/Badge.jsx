/** Huy hiệu nhỏ. `tone` quyết định màu, dùng chung với màu các buổi trong ngày. */
const tones = {
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)]',
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-ink-soft)]',
}

export default function Badge({ tone = 'primary', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1 ${tones[tone] || tones.primary} ${className}`}>
      {children}
    </span>
  )
}
