export default function Field({ label, hint, error, required, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 last:mb-0">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-ink)]">
          {label} {required && <span className="text-[var(--color-danger)]">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-[var(--color-ink-soft)]">{hint}</span>}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  )
}
