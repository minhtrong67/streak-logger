import { exportToCsv, exportToExcel, exportToJson, exportToPdf, exportToPng, exportToWord, timestampSuffix } from './exportData'
import { formatDateOnly, getPeriodOfDay } from './date'

/**
 * Mô tả cột của bảng nhật ký streak, dùng chung cho mọi định dạng xuất.
 * `labelKey` là khóa i18n của tiêu đề cột, `get` lấy giá trị hiển thị.
 */
export const POST_COLUMNS = [
  { key: 'date', labelKey: 'common.date', weight: 1.2, get: (r) => formatDateOnly(r.post_date) },
  { key: 'time', labelKey: 'common.time', weight: 0.8, get: (r) => r.post_time?.slice(0, 5) },
  { key: 'period', labelKey: 'streakPost.filterPeriod', weight: 1, get: (r, t) => t(`streakPost.period.${getPeriodOfDay(r.post_time)}`) },
  { key: 'duration', labelKey: 'streakPost.fieldDuration', weight: 1.6, get: (r) => r.duration },
  { key: 'description', labelKey: 'common.description', weight: 3, get: (r) => r.description || '' },
]

/** Chỉ giữ các trường dữ liệu thật (bỏ Timestamp nội bộ của Firestore) để xuất JSON. */
export function toPlainPost(row) {
  return {
    post_date: row.post_date,
    post_time: row.post_time,
    duration: row.duration,
    description: row.description || null,
  }
}

/**
 * Xuất danh sách nhật ký theo định dạng đã chọn.
 * @returns {Promise<{truncated?: number}|undefined>}
 */
export async function exportPostsAs(format, rows, columns, title, suffix = '') {
  const base = `streak-logger-nhat-ky${suffix}-${timestampSuffix()}`
  switch (format) {
    case 'csv':
      return exportToCsv(rows, columns, `${base}.csv`)
    case 'json':
      return exportToJson(rows.map(toPlainPost), `${base}.json`)
    case 'excel':
      return exportToExcel([{ name: title, columns, rows }], `${base}.xlsx`)
    case 'word':
      return exportToWord(rows, columns, `${base}.docx`, title)
    case 'pdf':
      return exportToPdf(rows, columns, `${base}.pdf`, title)
    case 'png':
      return exportToPng(rows, columns, `${base}.png`, title)
    default:
      throw new Error(`Định dạng không hỗ trợ: ${format}`)
  }
}
