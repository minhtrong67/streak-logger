import { Check } from "lucide-react";

/**
 * A fully custom checkbox rather than a bare `<input type="checkbox">` with
 * `accent-color`: native checkbox rendering (rounded corners, checkmark
 * contrast) is inconsistent across browsers and doesn't reliably adapt to
 * dark mode. This version is explicit in both states/themes.
 */
export default function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  ...props
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...props}
        />
        <span className="w-[24px] h-[24px] rounded-md border-2 border-[var(--color-divider)] bg-[var(--color-surface)] flex items-center justify-center transition-all duration-150 hover:border-[var(--color-primary)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-surface)]">
          <Check
            size={13}
            strokeWidth={3}
            className={`text-[var(--color-primary-ink)] transition-transform duration-150 ${checked ? "scale-100" : "scale-0"}`}
          />
        </span>
      </span>
      {label && (
        <span className="text-sm text-[var(--color-ink)]">{label}</span>
      )}
    </label>
  );
}
