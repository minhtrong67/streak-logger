import Papa from 'papaparse'
import { validatePost } from './validation'

/** Các định dạng tệp cho phép khi nhập dữ liệu. */
export const IMPORT_ACCEPT = '.csv,.json,.xlsx,.xls'

/** Dung lượng tệp tối đa khi nhập (5 MB) để tránh treo trình duyệt. */
const MAX_IMPORT_BYTES = 5 * 1024 * 1024

/* ============================================================
   Đọc tệp: CSV, JSON, Excel đều trả về mảng object thô (theo tên cột).
   Thư viện xlsx được nạp lười (dynamic import) vì chỉ cần khi người
   dùng thật sự nhập/xuất Excel, giúp bundle chính nhẹ hơn.
   ============================================================ */

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

async function parseExcelFile(file) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // raw: true giữ nguyên số (ngày/giờ Excel dạng số serial) để tự chuyển đổi chính xác.
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true })
}

async function parseJsonFile(file) {
  const parsed = JSON.parse(await file.text())
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.streakPosts)) return parsed.streakPosts
  throw new Error('Tệp JSON không đúng cấu trúc')
}

/** Đọc tệp theo phần mở rộng. Ném lỗi nếu quá lớn hoặc sai định dạng. */
export async function parseDataFile(file) {
  if (file.size > MAX_IMPORT_BYTES) throw new Error('Tệp quá lớn (tối đa 5 MB)')
  const name = (file.name || '').toLowerCase()
  let records
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) records = await parseExcelFile(file)
  else if (name.endsWith('.json')) records = await parseJsonFile(file)
  else if (name.endsWith('.csv')) records = await parseCsvFile(file)
  else throw new Error('Định dạng tệp không được hỗ trợ')
  return records.filter((r) => r && typeof r === 'object')
}

/* ============================================================
   Chuyển bản ghi thô thành nhật ký hợp lệ.
   Chấp nhận cả tên cột tiếng Việt (tệp do app xuất ra) lẫn tiếng Anh.
   ============================================================ */

/** Bỏ dấu, viết thường, chỉ giữ chữ và số để so khớp tên cột linh hoạt. */
function normalizeKey(key) {
  return String(key)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const FIELD_ALIASES = {
  date: ['date', 'postdate', 'ngay'],
  time: ['time', 'posttime', 'gio'],
  duration: ['duration', 'thoiluong'],
  description: ['description', 'mota'],
}

function pickField(record, aliases) {
  for (const [key, value] of Object.entries(record)) {
    if (aliases.includes(normalizeKey(key))) return value
  }
  return ''
}

const pad = (n) => String(n).padStart(2, '0')

/** Chuyển số serial của Excel (ngày 1 = 1900-01-01) thành chuỗi YYYY-MM-DD. */
function serialToDate(serial) {
  const ms = Math.floor(serial - 25569) * 86400000
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** Nhận YYYY-MM-DD, D/M/YYYY, D-M-YYYY, D.M.YYYY, Date hoặc số serial Excel. Trả về '' nếu không hiểu. */
export function normalizeDate(value) {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }
  if (typeof value === 'number') return value >= 1 ? serialToDate(value) : ''
  const str = String(value ?? '').trim()
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/.exec(str)
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`
  // Quy ước Việt Nam: ngày/tháng/năm
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(str)
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`
  return ''
}

/** Nhận H:mm, HH:mm:ss, 14h30 hoặc phần thập phân của Excel. Rỗng thì mặc định 00:00, sai định dạng trả null. */
export function normalizeTime(value) {
  if (typeof value === 'number') {
    const minutes = Math.round((value - Math.floor(value)) * 1440) % 1440
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
  }
  const str = String(value ?? '').trim()
  if (!str) return '00:00'
  const m = /^(\d{1,2})\s*[:h.]\s*(\d{2})(?::\d{2})?$/i.exec(str)
  return m ? `${pad(m[1])}:${m[2]}` : null
}

/**
 * Chuyển mảng bản ghi thô thành các nhật ký đã kiểm tra hợp lệ.
 * @returns {{ valid: object[], invalid: number }}
 */
export function mapRecordsToPosts(records) {
  const valid = []
  let invalid = 0
  records.forEach((record) => {
    const time = normalizeTime(pickField(record, FIELD_ALIASES.time))
    const { values, errors } = validatePost({
      duration: pickField(record, FIELD_ALIASES.duration),
      post_date: normalizeDate(pickField(record, FIELD_ALIASES.date)),
      post_time: time ?? '',
      description: pickField(record, FIELD_ALIASES.description),
    })
    if (Object.keys(errors).length) invalid += 1
    else valid.push(values)
  })
  return { valid, invalid }
}
