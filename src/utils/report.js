import { PDF_FONT, registerPdfFonts } from './pdfFonts'
import { drawPdfFooters, drawPdfHeader, formatStamp } from './exportData'
import { PERIOD_HEX } from './period'

/**
 * Xuất báo cáo thống kê dạng PDF theo mức đã chọn (ngày/tuần/tháng/năm).
 * Biểu đồ cột và biểu đồ tròn được vẽ trực tiếp bằng jsPDF (vector, nét sắc)
 * và dùng font Unicode nhúng sẵn nên không lỗi chữ tiếng Việt.
 */

const RANGE_TITLE = { day: 'Theo ngày', week: 'Theo tuần', month: 'Theo tháng', year: 'Theo năm' }
const CARD_COLORS = ['#7C3AED', '#6366F1', '#A855F7', '#0EA5E9']
const MARGIN = 40

/** Làm tròn lên một giá trị "đẹp" cho trục tung (1, 2, 5, 10, ...). */
function niceMax(max) {
  if (max <= 5) return 5
  const pow = 10 ** Math.floor(Math.log10(max))
  const norm = max / pow
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return step * pow
}

function drawSectionTitle(doc, text, y) {
  doc.setFont(PDF_FONT, 'bold')
  doc.setFontSize(12)
  doc.setTextColor('#18181B')
  doc.text(text, MARGIN, y)
  doc.setDrawColor('#7C3AED')
  doc.setLineWidth(2)
  doc.line(MARGIN, y + 6, MARGIN + 28, y + 6)
}

/** Thẻ số liệu nền màu nổi bật. */
function drawCards(doc, metrics, y) {
  const gap = 10
  const width = (doc.internal.pageSize.getWidth() - MARGIN * 2 - gap * (metrics.length - 1)) / metrics.length
  metrics.forEach((m, i) => {
    const x = MARGIN + i * (width + gap)
    doc.setFillColor(CARD_COLORS[i % CARD_COLORS.length])
    doc.roundedRect(x, y, width, 62, 8, 8, 'F')
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor('#EDE9FE')
    doc.text(m.label, x + 12, y + 20)
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(m.value.length > 9 ? 12 : 17)
    doc.setTextColor('#FFFFFF')
    doc.text(m.value, x + 12, y + 44)
  })
}

/** Biểu đồ cột dọc có lưới, nhãn trục và số liệu trên đầu cột. */
function drawBarChart(doc, series, y, height) {
  const chartX = MARGIN + 26
  const chartW = doc.internal.pageSize.getWidth() - MARGIN * 2 - 26
  const baseY = y + height
  const max = niceMax(Math.max(...series.map((s) => s.count), 1))
  const ticks = 5

  doc.setFont(PDF_FONT, 'normal')
  doc.setFontSize(7.5)
  for (let i = 0; i <= ticks; i++) {
    const value = (max / ticks) * i
    const ty = baseY - (height * i) / ticks
    doc.setDrawColor('#E4E4E7')
    doc.setLineWidth(0.5)
    doc.line(chartX, ty, chartX + chartW, ty)
    doc.setTextColor('#71717A')
    doc.text(String(Math.round(value * 10) / 10), chartX - 6, ty + 2.5, { align: 'right' })
  }

  const slot = chartW / series.length
  const barW = Math.min(26, slot * 0.6)
  const labelEvery = series.length > 16 ? 2 : 1
  series.forEach((s, i) => {
    const cx = chartX + slot * i + slot / 2
    const h = (s.count / max) * height
    if (s.count > 0) {
      doc.setFillColor('#7C3AED')
      doc.roundedRect(cx - barW / 2, baseY - h, barW, h, 2, 2, 'F')
      doc.setFont(PDF_FONT, 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor('#18181B')
      doc.text(String(s.count), cx, baseY - h - 4, { align: 'center' })
    }
    if (i % labelEvery === 0) {
      doc.setFont(PDF_FONT, 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor('#52525B')
      doc.text(s.label, cx, baseY + 12, { align: 'center' })
    }
  })
}

/** Vẽ một hình quạt bằng đa giác nhiều điểm (jsPDF không có lệnh vẽ cung tô màu). */
function drawSlice(doc, cx, cy, r, startAngle, endAngle, color) {
  const steps = Math.max(2, Math.ceil(((endAngle - startAngle) * 180) / Math.PI / 3))
  const points = [[cx, cy]]
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + ((endAngle - startAngle) * i) / steps
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  const vectors = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]])
  doc.setFillColor(color)
  doc.setDrawColor('#FFFFFF')
  doc.setLineWidth(1)
  doc.lines(vectors, points[0][0], points[0][1], [1, 1], 'FD', true)
}

/** Biểu đồ tròn theo buổi trong ngày kèm chú thích số liệu bên phải. */
function drawPieWithLegend(doc, periodCounts, y) {
  const total = periodCounts.reduce((s, p) => s + p.count, 0)
  const r = 58
  const cx = MARGIN + r + 10
  const cy = y + r

  if (total === 0) {
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#71717A')
    doc.text('Chưa có dữ liệu trong khoảng này.', MARGIN, y + 20)
    return
  }

  let angle = -Math.PI / 2
  periodCounts.forEach((p) => {
    if (!p.count) return
    const sweep = (p.count / total) * Math.PI * 2
    // Một quạt chiếm trọn 100% cần vẽ như hình tròn đầy đủ.
    if (p.count === total) {
      doc.setFillColor(PERIOD_HEX[p.key])
      doc.circle(cx, cy, r, 'F')
    } else drawSlice(doc, cx, cy, r, angle, angle + sweep, PERIOD_HEX[p.key])
    angle += sweep
  })

  const legendX = cx + r + 60
  periodCounts.forEach((p, i) => {
    const ly = y + 22 + i * 26
    doc.setFillColor(PERIOD_HEX[p.key])
    doc.circle(legendX, ly - 3, 4.5, 'F')
    doc.setFont(PDF_FONT, 'bold')
    doc.setFontSize(10)
    doc.setTextColor('#18181B')
    doc.text(p.name, legendX + 12, ly)
    const percent = Math.round((p.count / total) * 100)
    doc.setFont(PDF_FONT, 'normal')
    doc.setTextColor('#52525B')
    doc.text(`${p.count} mục (${percent}%)`, legendX + 80, ly)
  })
}

/**
 * @param {object} data
 * @param {string} data.rangeKey day | week | month | year
 * @param {string} data.rangeLabel Nhãn khoảng thời gian, ví dụ "Tháng 9/2026"
 * @param {{label:string,value:string}[]} data.cards Các thẻ số liệu (tối đa 4)
 * @param {{label:string,count:number}[]} data.series Dữ liệu biểu đồ cột
 * @param {{key:string,name:string,count:number}[]} data.periodCounts Dữ liệu biểu đồ tròn
 * @param {object[]} data.rows Nhật ký trong khoảng (đã sắp xếp)
 * @param {{label:string,value:Function}[]} data.columns Cột của bảng chi tiết
 */
export async function exportStatsReport({ rangeKey, rangeLabel, cards, series, periodCounts, rows, columns, filename }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  await registerPdfFonts(doc)

  drawPdfHeader(doc, 'Báo cáo thống kê streak', `${RANGE_TITLE[rangeKey]}: ${rangeLabel} · Xuất lúc ${formatStamp()}`)

  drawCards(doc, cards, 98)

  drawSectionTitle(doc, 'Số mục theo thời gian', 194)
  drawBarChart(doc, series, 222, 150)

  drawSectionTitle(doc, 'Phân bổ theo buổi trong ngày', 418)
  drawPieWithLegend(doc, periodCounts, 436)

  drawSectionTitle(doc, `Chi tiết nhật ký (${rows.length} mục)`, 588)
  if (rows.length === 0) {
    doc.setFont(PDF_FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#71717A')
    doc.text('Không có nhật ký nào trong khoảng thời gian này.', MARGIN, 614)
  } else {
    autoTable(doc, {
      startY: 604,
      head: [columns.map((c) => c.label)],
      body: rows.map((row) => columns.map((c) => String(c.value(row) ?? ''))),
      styles: { font: PDF_FONT, fontSize: 9, cellPadding: 6, textColor: '#27272A', lineColor: '#E4E4E7', lineWidth: 0.5 },
      headStyles: { font: PDF_FONT, fontStyle: 'bold', fillColor: '#7C3AED', textColor: '#FFFFFF' },
      alternateRowStyles: { fillColor: '#F5F3FF' },
      margin: { left: MARGIN, right: MARGIN, bottom: 40 },
    })
  }

  drawPdfFooters(doc)
  doc.save(filename)
}
