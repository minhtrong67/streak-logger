export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
      }`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}
