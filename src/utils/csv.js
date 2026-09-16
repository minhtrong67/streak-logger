import Papa from 'papaparse'
import beVietnamRegularUrl from '../assets/fonts/BeVietnamPro-Regular.ttf?url'
import beVietnamBoldUrl from '../assets/fonts/BeVietnamPro-Bold.ttf?url'

/* ============================================================
   Import — accepts .csv, .xlsx and .xls. Both parsers resolve to
   the same shape: an array of plain objects keyed by header name,
   so callers only need one mapping/validation step regardless of
   which file type the user picked.

   xlsx and jsPDF are both loaded lazily (dynamic import) — they're
   only needed the moment someone actually imports/exports a file,
   so the app-shell bundle (and the PWA precache) stays small.
   ============================================================ */
export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => (typeof v === 'string' ? v.trim() : v),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export async function parseExcelFile(file) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
  return rows.map((row) => {
    const out = {}
    Object.entries(row).forEach(([k, v]) => {
      out[k.trim()] = typeof v === 'string' ? v.trim() : v
    })
    return out
  })
}

/** Parses a CSV or Excel file based on its extension. */
export function parseDataFile(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseExcelFile(file)
  return parseCsvFile(file)
}

export const IMPORT_ACCEPT = '.csv,.xlsx,.xls'

/* ============================================================
   Export — CSV, Excel (.xlsx), and PDF. `columns` is a shared
   description used by every format: [{ label, value(row) }].
   ============================================================ */
export function exportToCsv(rows, columns, filename) {
  const csv = Papa.unparse({
    fields: columns.map((c) => c.label),
    data: rows.map((row) => columns.map((c) => c.value(row))),
  })
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export async function exportToExcel(rows, columns, filename) {
  const XLSX = await import('xlsx')
  const data = rows.map((row) => {
    const obj = {}
    columns.forEach((c) => {
      obj[c.label] = c.value(row) ?? ''
    })
    return obj
  })
  const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.label) })
  worksheet['!cols'] = columns.map((c) => ({ wch: Math.max(12, c.label.length + 6) }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' })
}

// The Be Vietnam Pro TTFs are loaded once and cached as base64 so every
// PDF export after the first one is instant. jsPDF's built-in fonts
// (Helvetica/Times) have no Vietnamese glyphs, which is what causes the
// classic "broken font" PDF exports — embedding a real Unicode font here
// avoids that entirely.
let pdfFontsPromise = null

async function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function loadPdfFonts() {
  if (!pdfFontsPromise) {
    pdfFontsPromise = Promise.all([
      fetch(beVietnamRegularUrl).then((r) => r.arrayBuffer()),
      fetch(beVietnamBoldUrl).then((r) => r.arrayBuffer()),
    ]).then(async ([regular, bold]) => ({
      regular: await arrayBufferToBase64(regular),
      bold: await arrayBufferToBase64(bold),
    }))
  }
  return pdfFontsPromise
}

async function registerPdfFonts(doc) {
  const fonts = await loadPdfFonts()
  doc.addFileToVFS('BeVietnamPro-Regular.ttf', fonts.regular)
  doc.addFont('BeVietnamPro-Regular.ttf', 'BeVietnamPro', 'normal')
  doc.addFileToVFS('BeVietnamPro-Bold.ttf', fonts.bold)
  doc.addFont('BeVietnamPro-Bold.ttf', 'BeVietnamPro', 'bold')
  doc.setFont('BeVietnamPro', 'normal')
}

export async function exportToPdf(rows, columns, filename, title) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const landscape = columns.length > 4
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' })
  await registerPdfFonts(doc)

  doc.setFont('BeVietnamPro', 'bold')
  doc.setFontSize(15)
  doc.setTextColor('#18181B')
  doc.text(title || filename, 40, 42)

  doc.setFont('BeVietnamPro', 'normal')
  doc.setFontSize(9)
  doc.setTextColor('#71717A')
  doc.text(`${rows.length} rows \u00b7 ${new Date().toLocaleString()}`, 40, 58)

  autoTable(doc, {
    startY: 72,
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => String(c.value(row) ?? ''))),
    styles: { font: 'BeVietnamPro', fontSize: 9, cellPadding: 7, textColor: '#27272A', lineColor: '#E4E4E7' },
    headStyles: { font: 'BeVietnamPro', fontStyle: 'bold', fillColor: '#FF9F43', textColor: '#FFFFFF' },
    alternateRowStyles: { fillColor: '#FAFAFA' },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFont('BeVietnamPro', 'normal')
      doc.setFontSize(8)
      doc.setTextColor('#A1A1AA')
      doc.text(
        `${doc.internal.getCurrentPageInfo().pageNumber} / ${pageCount}`,
        doc.internal.pageSize.getWidth() - 50,
        doc.internal.pageSize.getHeight() - 20,
      )
    },
  })

  doc.save(filename)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
