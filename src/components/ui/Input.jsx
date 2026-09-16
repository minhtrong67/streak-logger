import { forwardRef } from 'react'

const Input = forwardRef(function Input({ className = '', icon: Icon, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] pointer-events-none" />
      )}
      <input
        ref={ref}
        className={`w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] transition-colors ${Icon ? 'pl-9' : ''} ${className}`}
        {...props}
      />
    </div>
  )
})

export default Input
