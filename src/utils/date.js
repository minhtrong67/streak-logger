const WEEKDAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_SHORT_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const WEEKDAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_SHORT_VI = ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12']
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Short weekday label, e.g. "Mon" / "T2". `dayIndex` is 0 (Sun) – 6 (Sat), matching `Date#getDay()`. */
export function getWeekdayShort(dayIndex, lang = 'en') {
  return (lang === 'vi' ? WEEKDAYS_SHORT_VI : WEEKDAYS_SHORT_EN)[dayIndex]
}

/** Short month label, e.g. "Jan" / "Th01". `monthIndex` is 0–11, matching `Date#getMonth()`. */
export function getMonthShort(monthIndex, lang = 'en') {
  return (lang === 'vi' ? MONTHS_SHORT_VI : MONTHS_SHORT_EN)[monthIndex]
}

/** Monday-start ISO-ish week key + label for a given date. */
export function getWeekStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day // shift so Monday = start of week
  d.setDate(d.getDate() + diff)
  return d
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * Full localized date-time string, e.g.
 * vi: "Thứ Bảy, ngày 18 tháng 07 năm 2026, 14:30"
 * en: "Saturday, July 18, 2026, 14:30"
 */
export function formatFullDateTime(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'

  const weekday = WEEKDAYS_VI[d.getDay()]
  const dd = pad(d.getDate())
  const mm = pad(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())

  return `${weekday}, ${dd}/${mm}/${yyyy}, ${hh}:${min}`
}

/** Compact date-time for tables, e.g. "18/07/2026 14:30" */
export function formatCompactDateTime(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateOnly(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/**
 * Break down the difference between two dates into calendar-aware
 * years/months/days/hours/minutes/seconds. Always returns non-negative
 * parts; `isFuture` tells you whether `target` is ahead of `now`.
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

  const totalMs = end.getTime() - start.getTime()
  const totalDays = Math.floor(totalMs / 86400000)

  return { years, months, days, hours, minutes, seconds, totalDays, isFuture }
}

/** Human-readable elapsed string, e.g. "2 yrs 3 mo 10 days 5 hrs 12 min" */
export function formatElapsedParts(parts, t) {
  const segments = []
  if (parts.years > 0) segments.push(`${parts.years} ${t('timeStreak.years')}`)
  if (parts.months > 0) segments.push(`${parts.months} ${t('timeStreak.months')}`)
  segments.push(`${parts.days} ${parts.days === 1 ? t('timeStreak.day') : t('timeStreak.days')}`)
  segments.push(`${pad(parts.hours)} ${t('timeStreak.hours')}`)
  segments.push(`${pad(parts.minutes)} ${t('timeStreak.minutes')}`)
  // segments.push(`${pad(parts.seconds)} ${t('timeStreak.seconds')}`)
  return segments.join(' ')
}

export function toDateTimeLocalValue(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

/**
 * Bucket a "HH:mm" (or "HH:mm:ss") time string into a time-of-day period.
 * morning: 05:00–10:59, noon: 11:00–13:59, afternoon: 14:00–17:59,
 * evening: 18:00–04:59 (wraps past midnight).
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
