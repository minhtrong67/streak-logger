import Papa from 'papaparse'
import { PDF_FONT, registerPdfFonts } from './pdfFonts'

/**
 * Xuất dữ liệu ra CSV, JSON, Excel, Word, PDF và ảnh PNG.
 * `columns` là mô tả cột dùng chung cho mọi định dạng bảng:
 *   [{ label: 'Ngày', value: (row) => '...', weight: 1 }]
 * `weight` là tỉ lệ độ rộng cột (mặc định 1).
 *
 * Các thư viện nặng (xlsx, docx, jspdf) được nạp lười khi thật sự cần.
 */

const BRAND = '#7C3AED' // violet-600
const BRAND_DARK = '#5B21B6' // violet-800
const BRAND_SOFT = '#EDE9FE' // violet-100
const APP_CREDIT = 'Streak Logger · minhtrong67 · hỗ trợ bởi Claude'

/** Danh sách định dạng xuất dùng chung cho mọi menu Xuất. */
export const EXPORT_FORMATS = ['csv', 'json', 'excel', 'word', 'pdf', 'png']

const pad = (n) => String(n).padStart(2, '0')

/** Hậu tố thời gian cho tên tệp, ví dụ 20260929-1530. */
export function timestampSuffix(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

/** Chuỗi ngày giờ dạng 29/09/2026 15:30 dùng trong phần đầu tài liệu. */
export function formatStamp(date = new Date()) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Thu hồi URL sau một nhịp để trình duyệt kịp bắt đầu tải.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Ma trận giá trị chuỗi của bảng, dùng chung cho Word/PDF/PNG. */
function toMatrix(rows, columns) {
  return rows.map((row) => columns.map((c) => String(c.value(row) ?? '')))
}

/* ---------------------------- CSV ---------------------------- */

export function exportToCsv(rows, columns, filename) {
  const csv = Papa.unparse({
    fields: columns.map((c) => c.label),
    data: toMatrix(rows, columns),
  })
  // BOM giúp Excel mở đúng tiếng Việt có dấu.
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

/* ---------------------------- JSON ---------------------------- */

/** `data` là object/mảng bất kỳ đã được làm sạch (không chứa Timestamp của Firestore). */
export function exportToJson(data, filename) {
  const json = JSON.stringify(data, null, 2)
  downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8;' }), filename)
}

/* ---------------------------- Excel ---------------------------- */

/** Tên sheet Excel tối đa 31 ký tự và không chứa []:*?/\ */
function safeSheetName(name) {
  return String(name).replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Sheet'
}

/** `sheets`: [{ name, columns, rows }] cho phép nhiều sheet trong một tệp. */
export async function exportToExcel(sheets, filename) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, columns, rows }) => {
    const data = rows.map((row) => {
      const obj = {}
      columns.forEach((c) => {
        obj[c.label] = c.value(row) ?? ''
      })
      return obj
    })
    const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((c) => c.label) })
    worksheet['!cols'] = columns.map((c) => ({ wch: Math.max(14, Math.round(c.label.length * 1.5) + 6) * (c.weight > 1 ? 2 : 1) }))
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName(name))
  })
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx' })
}

/* ---------------------------- Word ---------------------------- */

export async function exportToWord(rows, columns, filename, title) {
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    ShadingType,
    AlignmentType,
    BorderStyle,
    PageOrientation,
  } = await import('docx')

  const landscape = columns.length > 4
  // docx tự hoán đổi chiều khi chọn LANDSCAPE nên luôn truyền kích thước dọc (A4, đơn vị DXA).
  const contentWidth = landscape ? 15398 : 9638
  const totalWeight = columns.reduce((sum, c) => sum + (c.weight || 1), 0)
  const widths = columns.map((c) => Math.floor((contentWidth * (c.weight || 1)) / totalWeight))

  const border = { style: BorderStyle.SINGLE, size: 4, color: 'D4D4D8' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const margins = { top: 80, bottom: 80, left: 120, right: 120 }

  /** Một ô có thể chứa nhiều dòng (mô tả có xuống dòng). */
  const makeCell = (text, index, { header = false, zebra = false } = {}) =>
    new TableCell({
      width: { size: widths[index], type: WidthType.DXA },
      borders,
      margins,
      shading: header
        ? { type: ShadingType.CLEAR, fill: BRAND.slice(1), color: 'auto' }
        : zebra
          ? { type: ShadingType.CLEAR, fill: 'F5F3FF', color: 'auto' }
          : undefined,
      children: [
        new Paragraph({
          children: String(text)
            .split('\n')
            .map(
              (line, i) =>
                new TextRun({
                  text: line,
                  break: i ? 1 : 0,
                  font: 'Arial',
                  size: 20,
                  bold: header,
                  color: header ? 'FFFFFF' : '27272A',
                }),
            ),
        }),
      ],
    })

  const table = new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: columns.map((c, i) => makeCell(c.label, i, { header: true })),
      }),
      ...toMatrix(rows, columns).map(
        (cells, r) =>
          new TableRow({
            cantSplit: true,
            children: cells.map((text, i) => makeCell(text, i, { zebra: r % 2 === 1 })),
          }),
      ),
    ],
  })

  const doc = new Document({
    creator: 'minhtrong67',
    title,
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT },
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
          },
        },
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: title, bold: true, size: 36, color: BRAND.slice(1), font: 'Arial' })],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `${rows.length} dòng · Xuất lúc ${formatStamp()}`,
                size: 18,
                color: '71717A',
                font: 'Arial',
              }),
            ],
          }),
          table,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 320 },
            children: [new TextRun({ text: APP_CREDIT, size: 16, color: 'A1A1AA', font: 'Arial' })],
          }),
        ],
      },
    ],
  })

  downloadBlob(await Packer.toBlob(doc), filename)
}

/* ---------------------------- PDF ---------------------------- */

/** Vẽ chân trang (tên app + số trang) cho tất cả các trang sau khi đã biết tổng số trang. */
export function drawPdfFooters(doc) {
  const total = doc.internal.getNumberOfPages()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(8)
    doc.setTextColor('#A1A1AA')
    doc.text(APP_CREDIT, 40, h - 20)
    doc.text(`Trang ${i} / ${total}`, w - 40, h - 20, { align: 'right' })
  }
}

/** Vẽ dải tiêu đề màu violet ở đầu trang đầu tiên. */
export function drawPdfHeader(doc, title, subtitle) {
  const w = doc.internal.pageSize.getWidth()
  doc.setFillColor(BRAND)
  doc.rect(0, 0, w, 78, 'F')
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(18)
  doc.setTextColor('#FFFFFF')
  doc.text(title, 40, 38)
  doc.setFont(PDF_FONT, 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor('#EDE9FE')
  doc.text(subtitle, 40, 58)
}

export async function exportToPdf(rows, columns, filename, title) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const landscape = columns.length > 4
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' })
  await registerPdfFonts(doc)

  drawPdfHeader(doc, title, `${rows.length} dòng · Xuất lúc ${formatStamp()}`)

  autoTable(doc, {
    startY: 98,
    head: [columns.map((c) => c.label)],
    body: toMatrix(rows, columns),
    styles: { font: PDF_FONT, fontSize: 9, cellPadding: 7, textColor: '#27272A', lineColor: '#E4E4E7', lineWidth: 0.5 },
    headStyles: { font: PDF_FONT, fontStyle: 'bold', fillColor: BRAND, textColor: '#FFFFFF' },
    alternateRowStyles: { fillColor: '#F5F3FF' },
    margin: { left: 40, right: 40, bottom: 40 },
  })

  drawPdfFooters(doc)
  doc.save(filename)
}

/* ---------------------------- PNG ---------------------------- */

const CANVAS_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
const MAX_CANVAS_PX = 16000 // giới hạn an toàn cho canvas trên trình duyệt di động

/** Ngắt dòng theo độ rộng thực đo bằng canvas, hỗ trợ cả xuống dòng thủ công và từ quá dài. */
function wrapText(ctx, text, maxWidth) {
  const lines = []
  String(text)
    .split('\n')
    .forEach((paragraph) => {
      if (!paragraph) {
        lines.push('')
        return
      }
      let line = ''
      paragraph.split(' ').forEach((word) => {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width <= maxWidth) {
          line = test
          return
        }
        if (line) lines.push(line)
        // Từ đơn quá dài: cắt theo ký tự.
        let chunk = ''
        for (const ch of word) {
          if (ctx.measureText(chunk + ch).width > maxWidth && chunk) {
            lines.push(chunk)
            chunk = ch
          } else chunk += ch
        }
        line = chunk
      })
      lines.push(line)
    })
  return lines
}

/**
 * Vẽ bảng dữ liệu thành ảnh PNG bằng canvas (không cần thư viện ngoài, dùng
 * font hệ thống nên tiếng Việt luôn đúng dấu).
 * @returns {Promise<{ truncated: number }>} số dòng bị lược bớt nếu bảng quá dài.
 */
export async function exportToPng(rows, columns, filename, title) {
  const W = 1200
  const PAD = 40
  const LINE = 20
  const CELL_PAD = 10
  const HEADER_H = 96
  const TABLE_HEAD_H = 44
  const FOOTER_H = 56
  const contentW = W - PAD * 2
  const totalWeight = columns.reduce((sum, c) => sum + (c.weight || 1), 0)
  const colW = columns.map((c) => (contentW * (c.weight || 1)) / totalWeight)
  const matrix = toMatrix(rows, columns)

  const measureCanvas = document.createElement('canvas')
  const mctx = measureCanvas.getContext('2d')
  mctx.font = `14px ${CANVAS_FONT}`

  // Tính trước số dòng và chiều cao từng hàng.
  const layouts = matrix.map((cells) => {
    const wrapped = cells.map((text, i) => wrapText(mctx, text, colW[i] - CELL_PAD * 2))
    const lineCount = Math.max(1, ...wrapped.map((l) => l.length))
    return { wrapped, height: lineCount * LINE + CELL_PAD * 2 }
  })

  const fixedH = HEADER_H + TABLE_HEAD_H + FOOTER_H + PAD
  const fullH = fixedH + layouts.reduce((s, l) => s + l.height, 0)
  const scale = fullH * 2 <= MAX_CANVAS_PX ? 2 : 1

  // Cắt bớt dòng nếu vượt giới hạn canvas.
  const maxH = MAX_CANVAS_PX / scale
  let usedH = fixedH
  let visible = 0
  while (visible < layouts.length && usedH + layouts[visible].height <= maxH - 40) {
    usedH += layouts[visible].height
    visible += 1
  }
  const truncated = layouts.length - visible
  const extraH = truncated > 0 ? 36 : 0
  const H = usedH + extraH

  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'middle'

  // Nền và dải tiêu đề
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = BRAND
  ctx.fillRect(0, 0, W, HEADER_H)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `700 28px ${CANVAS_FONT}`
  ctx.fillText(title, PAD, 40)
  ctx.fillStyle = '#EDE9FE'
  ctx.font = `14px ${CANVAS_FONT}`
  ctx.fillText(`${rows.length} dòng · Xuất lúc ${formatStamp()}`, PAD, 70)

  // Hàng tiêu đề bảng
  let y = HEADER_H + 16
  ctx.fillStyle = BRAND_SOFT
  ctx.fillRect(PAD, y, contentW, TABLE_HEAD_H - 8)
  ctx.fillStyle = BRAND_DARK
  ctx.font = `700 14px ${CANVAS_FONT}`
  let x = PAD
  columns.forEach((c, i) => {
    ctx.fillText(c.label, x + CELL_PAD, y + (TABLE_HEAD_H - 8) / 2)
    x += colW[i]
  })
  y += TABLE_HEAD_H - 8

  // Các hàng dữ liệu
  ctx.font = `14px ${CANVAS_FONT}`
  for (let r = 0; r < visible; r++) {
    const { wrapped, height } = layouts[r]
    if (r % 2 === 1) {
      ctx.fillStyle = '#FAF5FF'
      ctx.fillRect(PAD, y, contentW, height)
    }
    ctx.fillStyle = '#27272A'
    x = PAD
    wrapped.forEach((lines, i) => {
      lines.forEach((line, li) => ctx.fillText(line, x + CELL_PAD, y + CELL_PAD + li * LINE + LINE / 2))
      x += colW[i]
    })
    y += height
    ctx.fillStyle = '#E4E4E7'
    ctx.fillRect(PAD, y - 1, contentW, 1)
  }

  if (truncated > 0) {
    ctx.fillStyle = '#71717A'
    ctx.font = `italic 13px ${CANVAS_FONT}`
    ctx.fillText(`Còn ${truncated} dòng nữa. Hãy xuất PDF hoặc Excel để có đầy đủ dữ liệu.`, PAD, y + 20)
  }

  ctx.fillStyle = '#A1A1AA'
  ctx.font = `12px ${CANVAS_FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(APP_CREDIT, W / 2, H - 24)

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không thể tạo ảnh PNG'))), 'image/png'),
  )
  downloadBlob(blob, filename)
  return { truncated }
}
