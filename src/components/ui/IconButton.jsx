import { useRipple, RippleLayer } from "../../hooks/useRipple";

const tones = {
  primary:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:brightness-95",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)] hover:brightness-95",
  success:
    "bg-[var(--color-success-soft)] text-[var(--color-success)] hover:brightness-95",
  danger:
    "bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:brightness-95",
  neutral:
    "bg-[var(--color-surface-2)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
};

/**
 * `tone` renders an always-visible, filled circular pill: used for
 * datatable row actions per the design spec (never hidden behind hover,
 * always identifiable at a glance). Omit `tone` for the plain ghost
 * icon button used in cards/toolbars.
 */
export default function IconButton({
  icon: Icon,
  label,
  active = false,
  tone,
  className = "",
  size = 16,
  onPointerDown,
  ...props
}) {
  const { ripples, onPointerDown: fireRipple } = useRipple();
  const toneClass = tone
    ? `rounded-full ${tones[tone] || tones.neutral}`
    : `rounded-lg ${
        active
          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
      }`;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative overflow-hidden inline-flex items-center justify-center p-3 transition-all duration-150 active:scale-90 ${toneClass} ${className}`}
      onPointerDown={(e) => {
        if (!props.disabled) fireRipple(e);
        onPointerDown?.(e);
      }}
      {...props}
    >
      <RippleLayer ripples={ripples} tone="dark" />
      <Icon size={size} />
    </button>
  );
}
