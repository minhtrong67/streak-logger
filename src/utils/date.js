/**
 * Các hàm tiện ích về ngày giờ. Ứng dụng chỉ dùng tiếng Việt nên nhãn
 * thứ và tháng được cố định ở đây.
 */
const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const pad = (n) => String(n).padStart(2, '0')

/** Tên thứ đầy đủ. `dayIndex` từ 0 (Chủ Nhật) đến 6 (Thứ Bảy), khớp với Date#getDay(). */
export function getWeekdayLong(dayIndex) {
  return WEEKDAYS[dayIndex]
}

/** Tên thứ rút gọn, ví dụ "T2". */
export function getWeekdayShort(dayIndex) {
  return WEEKDAYS_SHORT[dayIndex]
}

/** Ngày bắt đầu của tuần (thứ Hai) chứa `date`, giờ đặt về 00:00. */
export function getWeekStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day // Thứ Hai là đầu tuần
  d.setDate(d.getDate() + diff)
  return d
}

/** Khóa ngày dạng YYYY-MM-DD theo giờ địa phương. */
export function dateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Ngày giờ đầy đủ, ví dụ "Thứ Bảy, 18/07/2026, 14:30". */
export function formatFullDateTime(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Ngày giờ gọn, ví dụ "18/07/2026 14:30". */
export function formatCompactDateTime(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Chỉ ngày, ví dụ "18/07/2026". Nhận Date hoặc chuỗi YYYY-MM-DD. */
export function formatDateOnly(date) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-')
    return `${d}/${m}/${y}`
  }
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/**
 * Tách chênh lệch giữa hai thời điểm thành năm/tháng/ngày/giờ/phút/giây
 * theo lịch. Các giá trị luôn không âm; `isFuture` cho biết mốc ở tương lai.
 */
export function computeElapsedParts(target, now = new Date()) {
  const targetDate = new Date(target)
  const nowDate = new Date(now)
  const isFuture = targetDate.getTime() > nowDate.getTime()
  const start = isFuture ? nowDate : targetDate
  const end = isFuture ? targetDate : nowDate

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()
  let hours = end.getHours() - start.getHours()
  let minutes = end.getMinutes() - start.getMinutes()
  let seconds = end.getSeconds() - start.getSeconds()

  if (seconds < 0) { seconds += 60; minutes -= 1 }
  if (minutes < 0) { minutes += 60; hours -= 1 }
  if (hours < 0) { hours += 24; days -= 1 }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
    months -= 1
  }
  if (months < 0) { months += 12; years -= 1 }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000)
  return { years, months, days, hours, minutes, seconds, totalDays, isFuture }
}

/** Chuỗi thời gian dễ đọc, ví dụ "2 năm 3 tháng 10 ngày 05 giờ 12 phút". */
export function formatElapsedParts(parts, t) {
  const segments = []
  if (parts.years > 0) segments.push(`${parts.years} ${t('timeStreak.years')}`)
  if (parts.months > 0) segments.push(`${parts.months} ${t('timeStreak.months')}`)
  segments.push(`${parts.days} ${t('timeStreak.days')}`)
  segments.push(`${pad(parts.hours)} ${t('timeStreak.hours')}`)
  segments.push(`${pad(parts.minutes)} ${t('timeStreak.minutes')}`)
  return segments.join(' ')
}

/** Giá trị cho input datetime-local (giờ địa phương, dạng YYYY-MM-DDTHH:mm). */
export function toDateTimeLocalValue(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

/**
 * Xếp một chuỗi giờ "HH:mm" vào buổi trong ngày.
 * Sáng 05:00-10:59, Trưa 11:00-13:59, Chiều 14:00-17:59, Tối 18:00-04:59.
 */
export function getPeriodOfDay(timeStr) {
  if (!timeStr) return 'evening'
  const hh = parseInt(String(timeStr).slice(0, 2), 10)
  if (Number.isNaN(hh)) return 'evening'
  if (hh >= 5 && hh < 11) return 'morning'
  if (hh >= 11 && hh < 14) return 'noon'
  if (hh >= 14 && hh < 18) return 'afternoon'
  return 'evening'
}

export const PERIOD_ORDER = ['morning', 'noon', 'afternoon', 'evening']
