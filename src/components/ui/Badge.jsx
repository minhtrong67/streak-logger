const tones = {
  teal: 'bg-[var(--color-teal-soft)] text-[var(--color-teal)]',
  amber: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  success: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)]',
  purple: 'bg-[#F1EAFB] text-[#7C3AED] dark:bg-[#241633] dark:text-[#B794F6]',
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-ink-soft)]',
}

export default function Badge({ tone = 'teal', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-1 ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
