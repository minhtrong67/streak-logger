export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 flex items-start gap-3.5">
      <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-5 w-16" />
      </div>
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-2 py-3.5">
          <SkeletonBlock className="h-4 w-full max-w-[8rem]" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 sm:p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-11 h-11 rounded-xl shrink-0" />
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <SkeletonBlock className="h-16 w-full rounded-xl" />
      <SkeletonBlock className="h-10 w-full rounded-xl" />
    </div>
  )
}
