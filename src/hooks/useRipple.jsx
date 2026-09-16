import { useCallback, useRef, useState } from 'react'

let rippleId = 0

/**
 * Minimal Material-style ripple: a translucent circle that expands from
 * the pointer position and fades out. Spread the returned `onPointerDown`
 * onto any `relative overflow-hidden` element, and render `ripples` as
 * absolutely-positioned children.
 *
 * Respects `prefers-reduced-motion` (handled globally in index.css via the
 * `.ripple` animation duration override) and is skipped entirely for
 * non-primary pointer buttons (e.g. right-click).
 */
export function useRipple() {
  const [ripples, setRipples] = useState([])
  const timeouts = useRef(new Set())

  const onPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.8
    const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2
    const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2
    const id = ++rippleId
    setRipples((prev) => [...prev, { id, x, y, size }])
    const timeout = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
      timeouts.current.delete(timeout)
    }, 550)
    timeouts.current.add(timeout)
  }, [])

  return { ripples, onPointerDown }
}

export function RippleLayer({ ripples, tone = 'light' }) {
  if (!ripples.length) return null
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className={`ripple ${tone === 'dark' ? 'ripple-dark' : 'ripple-light'}`}
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  )
}
