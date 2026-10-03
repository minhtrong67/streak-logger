import { useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useLang } from '../context/LangContext'

/** Quãng vuốt tối thiểu (px) để kích hoạt hành động. */
const TRIGGER_DISTANCE = 88
/** Quãng kéo tối đa (px), có lực cản nhẹ để cảm giác tự nhiên. */
const MAX_DISTANCE = 132
/** Ngưỡng (px) để xác định người dùng đang vuốt ngang hay cuộn dọc. */
const INTENT_DISTANCE = 8

/**
 * Bọc một thẻ để vuốt trên mobile:
 * vuốt sang phải = Sửa, vuốt sang trái = Xóa.
 * Cuộn dọc vẫn hoạt động bình thường (touch-action: pan-y). Sau khi vuốt,
 * thẻ tự trượt về vị trí cũ và hành động được gọi; việc xóa vẫn phải qua hộp
 * thoại xác nhận ở nơi gọi.
 */
export default function SwipeRow({ children, onSwipeRight, onSwipeLeft, className = '' }) {
  const { t } = useLang()
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ active: false, locked: false, startX: 0, startY: 0, moved: false })

  const reset = () => {
    setDragging(false)
    setOffset(0)
  }

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { active: true, locked: false, startX: e.clientX, startY: e.clientY, moved: false }
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (!d.locked) {
      // Chưa xác định hướng: chờ người dùng di chuyển đủ xa.
      if (Math.abs(dx) < INTENT_DISTANCE && Math.abs(dy) < INTENT_DISTANCE) return
      if (Math.abs(dy) > Math.abs(dx)) {
        d.active = false // đang cuộn dọc, không can thiệp
        return
      }
      d.locked = true
      d.moved = true
      setDragging(true)
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }

    // Chỉ cho kéo về phía có hành động tương ứng.
    let next = dx
    if (dx > 0 && !onSwipeRight) next = 0
    if (dx < 0 && !onSwipeLeft) next = 0
    const limit = MAX_DISTANCE
    const sign = Math.sign(next)
    const abs = Math.abs(next)
    // Sau quãng kích hoạt, kéo thêm sẽ nặng dần.
    const damped = abs > TRIGGER_DISTANCE ? TRIGGER_DISTANCE + (abs - TRIGGER_DISTANCE) * 0.35 : abs
    setOffset(sign * Math.min(damped, limit))
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    const current = offset
    reset()
    if (!d.locked) return
    if (current >= TRIGGER_DISTANCE && onSwipeRight) onSwipeRight()
    else if (current <= -TRIGGER_DISTANCE && onSwipeLeft) onSwipeLeft()
  }

  // Chặn sự kiện click phát sinh ngay sau một thao tác vuốt (tránh mở modal xem chi tiết).
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.stopPropagation()
      e.preventDefault()
      drag.current.moved = false
    }
  }

  const progress = Math.min(Math.abs(offset) / TRIGGER_DISTANCE, 1)

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] ${className}`}>
      {/* Lớp nền hành động phía sau thẻ */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-start gap-2 px-5 bg-[var(--color-primary)] text-[var(--color-primary-ink)] text-sm font-medium transition-opacity ${offset > 0 ? 'opacity-100' : 'opacity-0'}`}
      >
        <Pencil size={18} style={{ transform: `scale(${0.8 + progress * 0.3})` }} />
        {t('common.swipeEdit')}
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-end gap-2 px-5 bg-[var(--color-danger-solid)] text-white text-sm font-medium transition-opacity ${offset < 0 ? 'opacity-100' : 'opacity-0'}`}
      >
        {t('common.swipeDelete')}
        <Trash2 size={18} style={{ transform: `scale(${0.8 + progress * 0.3})` }} />
      </div>

      <div
        className="swipe-surface relative"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  )
}
