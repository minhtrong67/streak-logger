import { ChevronDown } from 'lucide-react'

export default function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] pointer-events-none" />
    </div>
  )
}
