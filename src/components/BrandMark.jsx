import { Flame } from 'lucide-react'

/**
 * Logo ngọn lửa nền violet dùng ở sidebar, header và màn hình chờ.
 * Bo góc tính theo tỉ lệ (30%) để khớp chính xác với icon ứng dụng và favicon
 * (public/favicon.svg), dù logo được hiển thị ở kích thước nào.
 */
export default function BrandMark({ size = 36 }) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 text-white shrink-0 shadow-sm"
    >
      <Flame size={Math.round(size * 0.5)} />
    </span>
  )
}
