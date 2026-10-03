# Streak Logger

Ứng dụng web theo dõi mốc thời gian (streak) và ghi nhật ký streak hằng ngày, kèm thống kê trực quan. Đăng nhập bằng Google, dữ liệu lưu trên Firebase và đồng bộ theo thời gian thực giữa các thiết bị.

Phát triển bởi **minhtrong67**, có sự hỗ trợ của **Claude (Anthropic)**.

## Tính năng

- **Đăng nhập với Google** (Firebase Authentication). Mỗi tài khoản chỉ truy cập được dữ liệu của chính mình.
- **Mốc thời gian**: theo dõi khoảng thời gian đã trôi qua từ một mốc bạn chọn (năm, tháng, ngày, giờ, phút), có nút sao chép nhanh.
- **Nhật ký streak**: thêm, sửa, xóa (có hộp thoại xác nhận), xem chi tiết.
  - Trên mobile: **vuốt phải để sửa, vuốt trái để xóa**.
  - **Tìm kiếm, sắp xếp và bộ lọc** dạng accordion (buổi trong ngày, khoảng ngày), có tìm theo từng cột trên desktop.
  - **Nhập dữ liệu** từ CSV, JSON, Excel (.xlsx, .xls). Dòng trùng (cùng ngày, giờ, thời lượng) sẽ **ghi đè**, không tạo bản sao, nên nhập lại cùng một tệp nhiều lần vẫn an toàn.
  - **Xuất dữ liệu** ra CSV, JSON, Excel, Word, PDF và ảnh PNG. Có thể xuất toàn bộ hoặc chỉ các mục đã chọn.
- **Thống kê**: thẻ số liệu nổi bật, biểu đồ cột dọc và biểu đồ tròn có đầy đủ nhãn và chú thích. Xem theo **ngày, tuần, tháng, năm** (mặc định theo tháng), chuyển giữa các kỳ. **Xuất báo cáo PDF** theo mức đang chọn, dùng font Unicode nhúng sẵn nên không lỗi chữ tiếng Việt.
- **Cài đặt**: giao diện sáng, tối, hệ thống; cỡ chữ 3 mức; thẻ cài đặt ứng dụng (khi chưa cài); xuất toàn bộ dữ liệu; khôi phục mặc định; đăng xuất.
- **PWA** cài đặt được trên điện thoại. Màn hình chờ khi mở app đã cài **khớp với giao diện sáng hoặc tối** đang dùng, không bị nháy nền trắng.
- **Kiểm tra dữ liệu chặt chẽ**: mọi trường được tự động loại bỏ khoảng trắng thừa, kiểm tra độ dài, ngày giờ hợp lệ. Nhập sai sẽ hiện toast lỗi và không được lưu. Firestore Rules kiểm tra lại ở phía server.
- **Giao diện Modern Minimalist**, màu chủ đạo Violet của Tailwind CSS, giao diện tối dùng thang màu Zinc, font hệ thống `system-ui`, icon Lucide, skeleton khi tải, hiệu ứng chuyển động nhẹ, responsive ưu tiên mobile với bottom bar 4 tab.

## Công nghệ

- React 19, Vite, Tailwind CSS v4
- Firebase: Authentication (Google) và Cloud Firestore
- Recharts (biểu đồ), jsPDF và jspdf-autotable (PDF), docx (Word), SheetJS (Excel), PapaParse (CSV)
- vite-plugin-pwa (PWA), lucide-react (icon)

## Bắt đầu nhanh

### 1. Tạo dự án Firebase

1. Vào [Firebase Console](https://console.firebase.google.com) và tạo dự án mới.
2. **Authentication**: mở tab *Sign-in method*, bật nhà cung cấp **Google**.
3. **Firestore Database**: tạo cơ sở dữ liệu (chế độ production).
4. **Project settings > Your apps**: thêm ứng dụng Web (`</>`) và sao chép đoạn cấu hình.

### 2. Điền cấu hình vào file `.env`

File `.env` đã được tạo sẵn ở thư mục gốc. Điền các giá trị vào:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Khi chưa điền, màn hình đăng nhập sẽ hiện cảnh báo thiếu cấu hình.

### 3. Áp dụng Firestore Rules

Sao chép nội dung file `firestore.rules` vào **Firestore Database > Rules** rồi bấm *Publish*. Hoặc dùng Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

### 4. Chạy ứng dụng

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`. Lệnh build và xem thử bản production:

```bash
npm run build
npm run preview
```

## Triển khai

Sau khi triển khai (Firebase Hosting, Vercel, Netlify...), vào **Authentication > Settings > Authorized domains** và thêm tên miền của bạn, nếu không đăng nhập Google sẽ báo lỗi tên miền chưa được cấp phép. Ứng dụng là SPA nên cần cấu hình chuyển mọi đường dẫn về `index.html`.

## Cấu trúc dữ liệu Firestore

```
users/{uid}/timeStreaks/current     một mốc thời gian duy nhất
    title       chuỗi, 1 đến 100 ký tự
    start_at    chuỗi ISO 8601
    note        chuỗi tối đa 500 ký tự, hoặc null

users/{uid}/streakPosts/{id}        các nhật ký streak
    post_date   chuỗi YYYY-MM-DD
    post_time   chuỗi HH:mm
    duration    chuỗi, 1 đến 100 ký tự
    description chuỗi tối đa 2000 ký tự, hoặc null
```

Dữ liệu của mỗi người dùng nằm riêng dưới `users/{uid}`, nên Firestore Rules chỉ cần kiểm tra `request.auth.uid == uid`.

## Định dạng tệp khi nhập dữ liệu

Tệp CSV, Excel hoặc JSON cần có các cột sau (nhận cả tên tiếng Việt lẫn tiếng Anh, không phân biệt hoa thường và dấu):

| Cột | Tên khác | Ví dụ |
| --- | --- | --- |
| Ngày | `date`, `post_date` | `29/09/2026` hoặc `2026-09-29` |
| Giờ | `time`, `post_time` | `07:30` (bỏ trống sẽ là `00:00`) |
| Thời lượng | `duration` | `45 phút` |
| Mô tả | `description` | Tùy chọn |

Dòng thiếu thời lượng hoặc sai ngày giờ sẽ bị bỏ qua và được báo trong thông báo kết quả. Tệp do chính ứng dụng xuất ra có thể nhập lại trực tiếp. Dung lượng tối đa 5 MB.

## Cấu trúc thư mục

```
src/
  components/    thành phần giao diện (layout, form, menu xuất, vuốt thẻ...)
    ui/          thành phần nền tảng (Button, Modal, Toolbar...)
  context/       Auth, Theme, Appearance (cỡ chữ), Toast, Lang
  hooks/         useStreakPosts, useTimeStreak (Firestore realtime), usePwaInstall...
  lib/           khởi tạo Firebase
  pages/         Login, TimeStreaks, StreakPosts, Statistics, Settings
  utils/         kiểm tra dữ liệu, nhập, xuất, thống kê, báo cáo PDF
firestore.rules  quy tắc bảo mật Firestore
```

## Ghi chú về PWA và màn hình chờ

- **Icon và favicon** dùng đúng logo ngọn lửa ở header và sidebar (`public/favicon.svg` là nguồn, các ảnh PNG trong `public/icons` được xuất từ file này).
- **Màn hình chờ không bao giờ có nền trắng**: nền tím đậm (`#5b21b6`) ở giao diện sáng và đen (`#09090b`) ở giao diện tối, với logo ở giữa. Android lấy màu từ `manifest.webmanifest` (hoặc `manifest-dark.webmanifest`), iOS lấy từ các ảnh trong `public/splash` (khai báo trong `index.html`, tự chọn sáng hoặc tối theo giao diện hệ thống), còn khung chờ khi trang đang tải là phần `#boot` trong `index.html`.
- Trước khi React chạy, một đoạn script nhỏ trong `index.html` đọc giao diện đã lưu và áp dụng ngay lớp `dark`, màu nền và manifest tương ứng, nên khung hình đầu tiên luôn đúng màu.
- Với ứng dụng đã cài, hệ điều hành đọc lại manifest theo chu kỳ của nó. Sau khi cập nhật icon hoặc splash, hãy gỡ rồi cài lại ứng dụng để thấy thay đổi.

## Bản quyền

Phát triển bởi minhtrong67, có sự hỗ trợ của Claude (Anthropic).
