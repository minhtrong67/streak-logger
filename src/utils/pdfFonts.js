import beVietnamRegularUrl from '../assets/fonts/BeVietnamPro-Regular.ttf?url'
import beVietnamBoldUrl from '../assets/fonts/BeVietnamPro-Bold.ttf?url'

/**
 * Font dùng riêng cho file PDF. Font có sẵn của jsPDF (Helvetica, Times)
 * không có glyph tiếng Việt nên PDF sẽ bị lỗi chữ; vì vậy nhúng font
 * Unicode thật. Giao diện web vẫn chỉ dùng system-ui.
 *
 * Font được tải một lần, lưu dạng base64 để các lần xuất sau chạy tức thì.
 */
export const PDF_FONT = 'BeVietnamPro'

let fontsPromise = null

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(beVietnamRegularUrl).then((r) => r.arrayBuffer()),
      fetch(beVietnamBoldUrl).then((r) => r.arrayBuffer()),
    ])
      .then(([regular, bold]) => ({
        regular: arrayBufferToBase64(regular),
        bold: arrayBufferToBase64(bold),
      }))
      .catch((err) => {
        fontsPromise = null // cho phép thử lại lần sau nếu tải lỗi
        throw err
      })
  }
  return fontsPromise
}

/** Đăng ký font tiếng Việt vào một đối tượng jsPDF. */
export async function registerPdfFonts(doc) {
  const fonts = await loadFonts()
  doc.addFileToVFS('BeVietnamPro-Regular.ttf', fonts.regular)
  doc.addFont('BeVietnamPro-Regular.ttf', PDF_FONT, 'normal')
  doc.addFileToVFS('BeVietnamPro-Bold.ttf', fonts.bold)
  doc.addFont('BeVietnamPro-Bold.ttf', PDF_FONT, 'bold')
  doc.setFont(PDF_FONT, 'normal')
}
