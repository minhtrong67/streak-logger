export default function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center mb-4 text-[var(--color-ink-soft)]">
          <Icon size={22} />
        </div>
      )}
      <p className="text-sm text-[var(--color-ink-soft)] max-w-xs">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
