import { Loader2 } from 'lucide-react'
import { useRipple, RippleLayer } from '../../hooks/useRipple'

const variants = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] hover:brightness-105 active:brightness-95 shadow-sm',
  secondary: 'bg-[var(--color-surface-2)] text-[var(--color-ink)] hover:bg-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]',
  danger: 'bg-[var(--color-danger-soft)] text-white hover:brightness-105 active:brightness-95',
  outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]',
}

const sizes = {
  sm: 'text-xs px-2.5 py-1.5 rounded-[var(--radius-control)] gap-1.5',
  md: 'text-sm px-4 py-2 rounded-[var(--radius-control)] gap-2',
  lg: 'text-base px-5 py-2.5 rounded-[var(--radius-control)] gap-2',
}

const rippleTones = {
  primary: 'light',
  secondary: 'dark',
  ghost: 'dark',
  danger: 'light',
  outline: 'dark',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight = false,
  loading = false,
  className = '',
  children,
  disabled,
  onPointerDown,
  ...props
}) {
  const iconSize = size === 'sm' ? 14 : 16
  const { ripples, onPointerDown: fireRipple } = useRipple()
  return (
    <As
      className={`relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={(e) => {
        if (!disabled && !loading) fireRipple(e)
        onPointerDown?.(e)
      }}
      {...props}
    >
      <RippleLayer ripples={ripples} tone={rippleTones[variant]} />
      {loading ? (
        <Loader2 size={iconSize} className="shrink-0 animate-spin" />
      ) : (
        Icon && !iconRight && <Icon size={iconSize} className="shrink-0" />
      )}
      {children}
      {!loading && Icon && iconRight && <Icon size={iconSize} className="shrink-0" />}
    </As>
  )
}
