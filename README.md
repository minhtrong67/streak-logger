# Streak Logger

Dashboard cá nhân (một người dùng, không cần đăng nhập) để theo dõi streak — xây dựng bằng React, Supabase và Tailwind CSS, giao diện theo chuẩn **Material Design 3**.

Phát triển bởi **gnort67**, với sự hỗ trợ phát triển từ **Claude (Anthropic)**.

> Ứng dụng chỉ hỗ trợ **Tiếng Việt** — không có tùy chọn chuyển ngôn ngữ.

## Tính năng

- **Mốc thời gian (Time Streak)** — theo dõi một mốc thời gian duy nhất, thời gian đã trôi qua được đếm trực tiếp (năm, tháng, ngày, giờ, phút, giây). Mỗi giá trị thời gian đều có nút sao chép nhanh.
- **Nhật ký streak (Streak Posts)** — sổ nhật ký hằng ngày gồm ngày, giờ, thời lượng và mô tả:
  - Hiển thị dạng **bảng dữ liệu** trên desktop/tablet và dạng **card** trên mobile.
  - **Bộ lọc dạng accordion** (buổi trong ngày, khoảng ngày) — mở/đóng mượt, có huy hiệu báo đang lọc.
  - Tìm kiếm, sắp xếp, chọn nhiều dòng để xóa/xuất hàng loạt.
  - **Nhập tệp (Import CSV)**: hỗ trợ `.csv`, `.xlsx`, `.xls`. Nếu dòng dữ liệu nhập vào trùng khớp (ngày + giờ + thời lượng) với dữ liệu đã có, hệ thống sẽ **ghi đè** thay vì tạo bản sao trùng lặp.
  - **Xuất tệp (Export)** dạng *split button*: bấm nút chính để xuất nhanh CSV, bấm mũi tên để chọn CSV / Excel / PDF. File PDF được nhúng sẵn font Unicode nên **không bị lỗi font tiếng Việt**.
- **Thống kê (Statistics)** — thẻ tổng quan xếp cột trên mobile: streak hiện tại, tổng số nhật ký, số mục trong tháng, số ngày hoạt động, buổi hoạt động nhiều nhất. Biểu đồ gồm **cột dọc** (theo thời gian, mặc định theo tháng — có thể đổi ngày/tuần/tháng/năm), **cột ngang** (theo thứ trong tuần) và **tròn** (theo buổi trong ngày).
- **Bố cục dashboard** — sidebar cố định trên desktop, thanh điều hướng dưới cùng kiểu app gốc trên mobile, cùng với **header riêng cho mobile**: bên trái là tên ứng dụng + nút mở sidebar dạng drawer, bên phải là nút tìm kiếm nhanh (Ctrl+K) và nút chuyển giao diện sáng/tối.
- **Trang Cài đặt** để cá nhân hóa, lưu ngay trên thiết bị: giao diện sáng/tối/theo hệ thống, cỡ chữ (nhỏ/vừa/lớn), và một trong 8 màu chủ đạo theo tông màu Material Design 3 (Material, Hổ phách, Đại dương, Bầu trời, Rừng xanh, Bạc hà, Hồng phấn, San hô).
- **Giao diện Material Design 3** — toàn bộ màu sắc theo bảng màu tông (tonal palette) chuẩn M3 (màu chủ đạo mặc định `#6750A4`), bo góc lớn theo chuẩn M3, không dùng hiệu ứng kính mờ (glassmorphism).
- **Font hệ thống (`system-ui`)** cho toàn bộ giao diện — không có tùy chọn đổi font chữ.
- **Icon-based UI** — không dùng emoji, dùng bộ icon [lucide-react](https://lucide.dev), các nút thao tác (xem/sửa/xóa) có nền màu riêng để dễ nhận biết.
- **Responsive đầy đủ** cho mobile/tablet/desktop, có skeleton loading và trạng thái nút khi đang xử lý.
- **PWA cài đặt được**, cache offline app-shell, banner báo mất mạng, icon ứng dụng và favicon đầy đủ kích thước theo phong cách Material Design 3.
- **Toast thông báo** cho các thao tác lưu/xóa/nhập/xuất.
- **Không cần đăng nhập** — mở lên là dùng ngay; giữ kín URL và anon key Supabase vì đó là thứ duy nhất bảo vệ dữ liệu của bạn.

## Công nghệ sử dụng

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [Supabase](https://supabase.com) (Postgres + RLS)
- [Tailwind CSS v4](https://tailwindcss.com)
- [recharts](https://recharts.org) — biểu đồ cột dọc/ngang, biểu đồ tròn
- [papaparse](https://www.papaparse.com) — nhập/xuất CSV
- [xlsx (SheetJS)](https://www.npmjs.com/package/xlsx) — nhập/xuất Excel
- [jspdf](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — xuất PDF (nhúng font Unicode, không lỗi tiếng Việt)
- [lucide-react](https://lucide.dev) — icon
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) — hỗ trợ PWA

## Cấu trúc thư mục

```
streak-dashboard/
├── public/
│   ├── icons/              # Icon ứng dụng đã tạo sẵn (favicon, PWA, maskable)
│   └── favicon.svg
├── src/
│   ├── components/         # Sidebar, header/Layout, form, các thành phần dùng chung
│   │   └── ui/              # Button, Input, Select, Checkbox, IconButton, Toolbar, Modal…
│   ├── context/             # Theme, Appearance (cỡ chữ + màu), Lang (tiếng Việt), Toast
│   ├── hooks/                # useTimeStreak, useStreakPosts, usePwaInstall…
│   ├── i18n/                 # vi.js — toàn bộ nhãn giao diện bằng tiếng Việt
│   ├── pages/                # TimeStreaks, StreakPosts, Statistics, Settings
│   └── utils/                # csv.js (nhập/xuất), date.js, period.js
└── supabase/
    └── schema.sql           # Cấu trúc bảng + RLS cho Supabase
```

## Bắt đầu

### 1. Tạo project Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, chạy nội dung file [`supabase/schema.sql`](./supabase/schema.sql) để tạo bảng `time_streaks`, `streak_posts` và RLS policy.
3. Vào **Project Settings → API**, lấy **Project URL** và **anon public key**.

### 2. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxx
```

### 3. Cài đặt & chạy

```bash
npm install
npm run dev       # chạy dev server
npm run build     # build production
npm run preview   # xem thử bản build
```

> **Lưu ý bảo mật:** Ứng dụng không có màn hình đăng nhập, kết nối Supabase trực tiếp bằng anon key. Hãy xem URL và anon key như một "liên kết bí mật" — chỉ chia sẻ với người bạn tin tưởng cho toàn bộ dữ liệu.

## Cài đặt như ứng dụng (PWA)

Trên trình duyệt hỗ trợ, vào trang **Cài đặt** trong app và bấm **Cài đặt** khi được gợi ý, hoặc dùng menu trình duyệt → "Thêm vào màn hình chính" / "Cài đặt ứng dụng". Ứng dụng vẫn hoạt động ngoại tuyến với dữ liệu đã tải trước đó nhờ cache app-shell.

## Giấy phép

Dự án cá nhân, dùng cho mục đích riêng của tác giả.
