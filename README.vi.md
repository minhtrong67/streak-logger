# Streak Logger

Bảng điều khiển riêng tư, dành cho một người dùng duy nhất để theo dõi các streak cá nhân — xây dựng bằng React, Supabase và Tailwind CSS.

Được xây dựng bởi **minhtrong67**, với sự hỗ trợ phát triển từ **Claude (Anthropic)**.

> 🇬🇧 English version: [README.md](./README.md)

## Tính năng

- **Mốc thời gian (Time Streak)** — chỉ quản lý duy nhất một mốc thời gian (ứng dụng được thiết kế cho một mốc duy nhất), thời gian trôi qua được cập nhật trực tiếp (năm, tháng, ngày, giờ, phút, giây). Mỗi giá trị thời gian (đã trôi qua, hiện tại, mốc) đều có nút sao chép nhanh.
- **Nhật ký streak (Streak Posts)** — sổ nhật ký hằng ngày với các trường ngày, giờ, thời lượng (duration) và mô tả; lọc theo buổi trong ngày (sáng / trưa / chiều / tối), tìm kiếm, sắp xếp, và xem chi tiết đầy đủ trong modal chỉ đọc.
- **Thống kê** — các thẻ tổng quan (streak hiện tại, tổng số nhật ký, số mục trong tháng, số ngày hoạt động, buổi hoạt động nhiều nhất) cùng biểu đồ số bài viết theo 30 ngày gần nhất và theo buổi trong ngày.
- **Bố cục dashboard** — sidebar trên desktop/tablet, thanh điều hướng dưới cùng kiểu app di động trên mobile; mỗi mục quản lý có tìm kiếm, sắp xếp, bộ lọc riêng và nhập/xuất CSV.
- **Trang Cài đặt** để cá nhân hóa giao diện, lưu ngay trên thiết bị: chủ đề sáng/tối/hệ thống, font chữ (Be Vietnam Pro hoặc Inter), cỡ chữ (nhỏ/vừa/lớn), và 1 trong 8 màu chủ đạo (Hổ phách, Đại dương, Bầu trời, Rừng xanh, Bạc hà, Hoàng gia, Hồng phấn, San hô).
- **Giao diện song ngữ** — Tiếng Anh và Tiếng Việt, chuyển đổi bất cứ lúc nào; lựa chọn của bạn sẽ được ghi nhớ.
- Mặc định dùng font **Be Vietnam Pro** (có thể đổi trong Cài đặt).
- **Giao diện dùng icon** — không dùng emoji, sử dụng bộ icon [lucide-react](https://lucide.dev).
- **Responsive hoàn toàn**, tối ưu cho di động, máy tính bảng và desktop, có skeleton loading và nút bấm hiện trạng thái đang xử lý/khóa nút khi đang gửi yêu cầu.
- **Hỗ trợ PWA có thể cài đặt** với bộ nhớ đệm offline, thông báo khi mất mạng, app icon và favicon đầy đủ các kích thước chuẩn.
- **Thông báo dạng toast** cho các thao tác lưu/xóa/nhập/xuất dữ liệu.
- **Không cần đăng nhập** — mở lên là dùng được ngay; hãy giữ kín URL và anon key của Supabase vì đó là thứ duy nhất bảo vệ dữ liệu của bạn khỏi bất kỳ ai có đường link.

## Công nghệ sử dụng

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [Supabase](https://supabase.com) (Postgres + Auth + RLS)
- [Tailwind CSS v4](https://tailwindcss.com)
- [recharts](https://recharts.org) cho biểu đồ
- [papaparse](https://www.papaparse.com) cho nhập/xuất CSV
- [lucide-react](https://lucide.dev) cho icon
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) cho hỗ trợ PWA

## Cấu trúc dự án

```
streak-dashboard/
├── public/
│   ├── icons/              # App icon đã tạo sẵn (favicon, PWA, maskable)
│   └── favicon.svg
├── src/
│   ├── components/         # Component UI dùng chung + theo tính năng
│   │   └── ui/             # Button, Modal, Input, Toolbar, v.v.
│   ├── context/             # Auth, Theme, Language, Toast providers
│   ├── hooks/                # useTimeStreaks, useStreakPosts, useNow
│   ├── i18n/                 # Từ điển en.js / vi.js
│   ├── pages/                 # Login, TimeStreaks, StreakPosts, Statistics
│   ├── utils/                 # date.js, csv.js
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── schema.sql             # Bảng, chính sách RLS, trigger
├── .env.example
└── vite.config.js
```

## Bắt đầu

### 1. Tạo dự án Supabase

1. Truy cập [supabase.com](https://supabase.com) và tạo một dự án mới.
2. Mở **SQL Editor** và chạy nội dung file [`supabase/schema.sql`](./supabase/schema.sql). Thao tác này sẽ tạo bảng `time_streaks` và `streak_posts`, với chính sách Row Level Security cho phép vai trò `anon` để ứng dụng chạy được ngay không cần cấu hình thêm.

### 2. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env` và điền URL cùng anon key của dự án (tìm trong **Settings → API**):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Cài đặt & chạy

```bash
npm install
npm run dev
```

Mở đường dẫn local được in ra và bắt đầu theo dõi streak — không cần đăng nhập.

### 4. Build cho production

```bash
npm run build
npm run preview
```

Thư mục `dist/` là một trang tĩnh — có thể triển khai ở bất kỳ đâu (Vercel, Netlify, Cloudflare Pages, server riêng, v.v.). Đây đã là một PWA hợp lệ và có thể cài đặt được.

## Nhập / Xuất (CSV, Excel, PDF)

**Nhật ký streak** hỗ trợ nhập từ **CSV hoặc Excel** (`.csv`, `.xlsx`, `.xls`) và xuất ra **CSV, Excel, hoặc PDF** ngay trên thanh công cụ — chọn định dạng từ menu Xuất. Tìm kiếm/sắp xếp/bộ lọc cũng áp dụng cho phần xuất, nên bạn có thể xuất một tập con đã lọc; các dòng đã chọn cũng có thể được xuất hoặc xóa hàng loạt. File PDF xuất ra được nhúng sẵn font Be Vietnam Pro nên tiếng Việt có dấu luôn hiển thị đúng, không bị lỗi font. Mốc thời gian chỉ còn một bản ghi duy nhất nên không còn thanh công cụ nhập/xuất — chỉ còn nút Sửa.

- Cột của **Nhật ký streak**: ngày, giờ, buổi trong ngày, thời lượng, mô tả (tiêu đề cột được dịch theo ngôn ngữ bạn chọn)

## Lưu ý về quyền riêng tư

Theo yêu cầu, ứng dụng **không có màn hình đăng nhập** — kết nối trực tiếp đến Supabase bằng anon key công khai. Điều này có nghĩa là bất kỳ ai có đường link ứng dụng đã triển khai _và_ URL/anon key Supabase nhúng trong bản build đều có thể đọc/ghi dữ liệu của bạn. Hãy giữ kín các thông tin này:

- Không chia sẻ đường link công khai, không commit file `.env` lên repository công khai.
- Nếu muốn bảo vệ chặt hơn, bạn có thể đặt mật khẩu cho trang đã triển khai (VD: password protection của Vercel/Netlify, hoặc basic-auth của nginx) mà không cần sửa code ứng dụng.
- Chính sách RLS trong `schema.sql` chỉ cho phép vai trò `anon` — không dự án Supabase nào khác có thể chạm vào dữ liệu này kể cả khi họ đoán đúng tên bảng.

## Nhật ký thay đổi

**Đợt hoàn thiện Material Design 3**

- Làm lại giao diện tối theo đúng bảng màu nền tối chuẩn của M3 (các tông surface/surface-container, on-surface, outline) thay vì bảng màu slate/zinc tự chọn trước đây — nền tối sâu và chuẩn tương phản hơn.
- Cập nhật bo góc theo thang hình khối của M3 (medium/large/extra-large: 12 / 16 / 28px), rõ nhất ở các hộp thoại.
- Nhật ký streak hiển thị dạng card trên di động thay vì bảng dữ liệu bị bó hẹp (desktop vẫn giữ bảng đầy đủ với sắp xếp, tìm kiếm theo cột, và gridlines).
- Các nút trên thanh công cụ (Bộ lọc/Nhập/Xuất) giờ luôn hiển thị cả icon **và** nhãn, ở mọi kích thước màn hình.
- Làm lại checkbox thành component tùy chỉnh hoàn toàn — checkbox gốc của trình duyệt không tương thích tốt với dark mode trên mọi trình duyệt, nên giờ checkbox chọn dòng hiển thị rõ ràng và nhất quán ở cả hai giao diện.
- Trang Thống kê: thêm bộ chọn khoảng thời gian Ngày/Tuần/Tháng/Năm (mặc định Tháng) điều khiển biểu đồ xu hướng, cùng biểu đồ cột ngang mới (số mục theo thứ trong tuần) bên cạnh biểu đồ cột dọc và biểu đồ tròn sẵn có — đủ cả 3 loại biểu đồ theo yêu cầu.
- Bộ chọn font trong Cài đặt rút gọn còn đúng 2 lựa chọn: Be Vietnam Pro và Inter.

**Icon & thương hiệu**

- Thiết kế lại favicon và toàn bộ app icon (16px → 512px, kèm bản maskable) theo phong cách Material phẳng, hình ảnh "ngọn lửa" hình học trên nền squircle, thay cho bản cũ có gradient/bóng loáng. Tạo lại `favicon.ico` và toàn bộ icon trong manifest PWA, đồng thời đồng bộ `theme-color`/màu manifest với màu nhấn mặc định thực tế của ứng dụng.

**Chuyển động**

- Thêm hiệu ứng gợn sóng (ripple) đúng chuẩn Material — vòng tròn lan tỏa và mờ dần từ điểm chạm — cho nút bấm, icon button, mục sidebar và tab thanh điều hướng dưới trên di động. Tự động chọn màu ripple sáng/tối tùy nền, và tôn trọng `prefers-reduced-motion` như các animation khác của ứng dụng.

**Bảng dữ liệu & công cụ dữ liệu**

- Bảng Nhật ký streak giờ có tiêu đề cột có thể bấm để sắp xếp (kèm icon hướng sắp xếp), ô tìm kiếm riêng cho cột Thời lượng và Mô tả, có gridlines rõ ràng, và phân trang cố định 20 dòng/trang.
- Các nút thao tác (Xem/Sửa/Xóa) giờ luôn hiển thị dưới dạng icon tròn có màu nền, thay vì icon mờ chỉ hiện khi hover.
- Nhập hỗ trợ cả CSV lẫn Excel; xuất có thể chọn CSV, Excel, hoặc PDF từ menu thả xuống. File PDF nhúng sẵn font hỗ trợ tiếng Việt nên không bao giờ bị lỗi dấu.
- Thư viện `xlsx` và `jsPDF` được tải lười (chỉ khi cần dùng) để không làm nặng bundle khởi động hay bộ nhớ đệm PWA.

**Điều hướng**

- Thêm bảng lệnh nhanh Ctrl+K / Cmd+K để nhảy thẳng đến bất kỳ trang nào, kèm nút tìm kiếm tương ứng trên header.

**Cài đặt**

- Thêm thẻ "Cài đặt ứng dụng" hiển thị lời mời cài đặt PWA gốc (hoặc gợi ý thay thế trên trình duyệt không hỗ trợ) khi ứng dụng chưa được cài đặt.

## Ghi công

- Tác giả: **minhtrong67**
- Được xây dựng với sự hỗ trợ phát triển từ **Claude** của Anthropic
