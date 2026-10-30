<div align="center">

<img src="public/favicon.svg" alt="Logo Streak Logger" width="112" height="112" />

# Streak Logger

**Giữ vững ngọn lửa streak.** Theo dõi thời gian từ một mốc, ghi nhật ký streak hằng ngày và xem tiến trình qua biểu đồ trực quan.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Material 3 Expressive](https://img.shields.io/badge/Thiết_kế-Material_3_Expressive-7C3AED)](https://m3.material.io)
[![PWA](https://img.shields.io/badge/PWA-cài_được-5A0FC8)](#pwa-và-màn-hình-chờ)

[English](README.md) · Tiếng Việt

</div>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Hệ thống thiết kế](#hệ-thống-thiết-kế)
- [Tùy chỉnh](#tùy-chỉnh)
- [Công nghệ](#công-nghệ)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Triển khai](#triển-khai)
- [Cấu trúc dữ liệu](#cấu-trúc-dữ-liệu-firestore)
- [Nhập dữ liệu](#định-dạng-tệp-khi-nhập-dữ-liệu)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [PWA và màn hình chờ](#pwa-và-màn-hình-chờ)
- [Lệnh](#lệnh)
- [Tác giả](#tác-giả)

## Giới thiệu

Streak Logger là ứng dụng web đề cao quyền riêng tư dành cho người đang xây dựng thói quen. Đăng nhập bằng Google, đặt một mốc (ví dụ "bỏ đường từ ngày…") và ứng dụng đếm thời gian trôi qua theo thời gian thực. Bên cạnh đó bạn ghi nhật ký streak, còn trang thống kê biến các mục đó thành biểu đồ. Dữ liệu đồng bộ tức thì giữa các thiết bị qua Firebase, mỗi tài khoản chỉ truy cập được dữ liệu của chính mình.

## Tính năng

| Mảng | Nội dung |
| --- | --- |
| **Mốc thời gian** | Đếm thời gian đã trôi qua (năm, tháng, ngày, giờ, phút) theo thời gian thực, có nút sao chép nhanh và đếm ngược cho mốc ở tương lai. |
| **Nhật ký streak** | Thêm, sửa, xem chi tiết bằng sheet toàn màn hình, xóa có xác nhận, nút nổi (FAB) để thêm. Tìm kiếm, sắp xếp, lọc (buổi trong ngày, khoảng ngày), tìm theo cột trên desktop, vuốt thẻ trên mobile (phải để sửa, trái để xóa) và xóa hàng loạt. |
| **Thống kê** | Thẻ số liệu nổi bật và **hai biểu đồ tròn** (phân bổ theo thời gian và theo buổi trong ngày) có đủ nhãn và số liệu ngay trên biểu đồ, kèm **thanh tiến độ phần trăm** ngay bên dưới mỗi biểu đồ. Xem theo ngày, tuần, tháng, năm. Xuất báo cáo **PDF chi tiết** hoặc **PNG** gọn (chỉ số liệu và hai biểu đồ tròn). |
| **Cài đặt** | Chế độ hiển thị, màu chủ đề và font chữ (mục thu gọn được), cỡ chữ, ngôn ngữ, **nhập và xuất nhật ký** (nhập CSV, JSON, Excel; xuất thêm Word, PDF, PNG), cài ứng dụng, khôi phục mặc định, đăng xuất và thẻ tác giả. |
| **An toàn** | Mọi thao tác sửa và xóa đều qua hộp thoại xác nhận. Dữ liệu được làm sạch và kiểm tra ở client, rồi kiểm tra lại bằng Firestore Rules. |
| **Dùng ngoại tuyến** | PWA cài được, có banner và toast khi mất mạng hoặc có mạng lại. |

## Hệ thống thiết kế

Giao diện theo **Material 3 Expressive**:

- **Màu sắc**: các vai trò màu (`primary`, `secondary-container`, `surface-container-*`, `outline-variant`...) được sinh khi chạy từ màu chủ đề đã chọn bằng thuật toán màu động của Material (biến thể *Vibrant*), cho cả sáng và tối. Màu thành công, cảnh báo, thông tin được hòa theo chủ đề đang dùng.
- **Hình khối**: bo góc lớn (thẻ 24px, hộp thoại và sheet 28px), nút dạng viên thuốc **biến hình** sang góc chặt hơn khi nhấn, logo "cookie" 12 cánh.
- **Chuyển động**: easing lò xo hơi nảy, easing emphasized cho chuyển trang và sheet, ripple và state layer ở mọi phần tử tương tác, danh sách hiện dần lần lượt. Tôn trọng `prefers-reduced-motion`.
- **Thành phần**: navigation drawer / rail, navigation bar có chỉ báo dạng viên thuốc, nhóm nút kết nối, nút biểu tượng tonal, ô nhập kiểu filled, công tắc, snackbar (toast), hộp thoại, sheet toàn màn hình và sheet đáy.
- **Nút hành động** trong mọi hộp thoại, hộp thoại xác nhận và sheet đều có **nhãn, biểu tượng và màu nền theo vai trò** để nhận diện ngay: Hủy (trung tính, `X`), Lưu (chính, `Check`), Cập nhật (chính, `Save`), Xóa (lỗi, `Trash2`), Đăng xuất và Đặt lại (cảnh báo).
- **Sheet và hộp thoại**: mọi thao tác thêm, sửa, xem chi tiết đều dùng sheet toàn màn hình; hộp thoại chỉ dành cho xác nhận ngắn. Cập nhật hoặc xóa luôn hỏi xác nhận trước. Danh sách lựa chọn trên mobile dùng sheet đáy.
- **Toast** có 4 biến thể (`info`, `success`, `error`, `warning`), hỗ trợ sáng và tối, tạm dừng khi rê chuột và có thanh đếm ngược.
- **Nút lên đầu trang** hiện khi cuộn xuống, cuộn mượt bằng easing requestAnimationFrame riêng (không phụ thuộc cài đặt giảm chuyển động của hệ điều hành hay `scroll-behavior` của CSS) và tự nâng lên phía trên FAB khi có FAB.
- **Dropdown tùy biến**: không dùng `<select>` gốc. Danh sách theo giao diện sáng/tối và màu chủ đề, mở bằng portal (không bị hộp thoại hay accordion cắt), tự lật lên khi thiếu chỗ, cao tối đa 280px có thanh cuộn và dùng được bằng bàn phím.
- **Thanh cuộn tùy biến**: mảnh, bo tròn, đổi màu theo chủ đề, có phương án dự phòng chuẩn cho Firefox.
- **Trang đăng nhập**: bố cục hai cột với khung hero thương hiệu (điểm nổi bật, hình cookie trang trí) và thẻ đăng nhập gọn; xếp dọc trên mobile.
- **Icon** dùng [Lucide](https://lucide.dev). Font mặc định là **font hệ thống**.

## Tùy chỉnh

Vào **Cài đặt** để đổi ngay lập tức, lưu theo từng thiết bị:

- **Chế độ hiển thị**: Sáng, Tối hoặc Hệ thống.
- **Màu chủ đề**: Tím violet (mặc định của thương hiệu) cùng 18 màu trong bảng màu Material Design: đỏ, hồng, tím, tím đậm, chàm, xanh dương, xanh da trời, lục lam, xanh mòng két, xanh lá, xanh lá nhạt, chanh, vàng, hổ phách, cam, cam đậm, nâu và xám xanh.
- **Cỡ chữ**: Nhỏ, Vừa hoặc Lớn (co giãn toàn bộ giao diện).
- **Font chữ**: Hệ thống (mặc định), Google Sans Flex, Roboto Flex, Roboto, Arial, Inter hoặc Be Vietnam Pro. Font web được đóng gói qua [Fontsource](https://fontsource.org), chỉ tải khi được chọn và lưu cache để dùng ngoại tuyến.
- **Ngôn ngữ**: Tiếng Việt hoặc English, áp dụng cho cả ngày giờ, thông báo kiểm tra dữ liệu, tệp xuất và báo cáo PDF.

Các mục dài (màu chủ đề, font chữ) là accordion thu gọn được và hiện lựa chọn hiện tại khi đang thu gọn. Thẻ tác giả (**minhtrong67**, với sự hỗ trợ của **Claude**) chỉ xuất hiện trong Cài đặt, ở vị trí cuối cùng.

## Công nghệ

- **Giao diện**: React 19, Vite, Tailwind CSS v4, icon Lucide
- **Màu sắc**: `@material/material-color-utilities`
- **Backend**: Firebase Authentication (Google) và Cloud Firestore
- **Biểu đồ và tệp**: Recharts, jsPDF + autotable, docx, SheetJS, PapaParse
- **PWA**: `vite-plugin-pwa` (Workbox)
- **Công cụ**: oxlint, sharp (sinh icon)

## Bắt đầu nhanh

### 1. Tạo dự án Firebase

1. Tạo dự án trong [Firebase Console](https://console.firebase.google.com).
2. **Authentication → Sign-in method**: bật nhà cung cấp **Google**.
3. **Firestore Database**: tạo cơ sở dữ liệu (chế độ production).
4. **Project settings → Your apps**: thêm ứng dụng Web và sao chép cấu hình.

### 2. Điền biến môi trường

Sao chép `.env.example` thành `.env` rồi điền giá trị:

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

Dán nội dung `firestore.rules` vào **Firestore Database → Rules** rồi Publish, hoặc dùng CLI:

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

Mở `http://localhost:5173`. Build bản production:

```bash
npm run build
npm run preview
```

## Triển khai

Triển khai thư mục `dist/` lên Firebase Hosting, Vercel, Netlify hoặc hosting tĩnh bất kỳ (đã có sẵn `vercel.json`). Đây là SPA nên mọi đường dẫn phải trả về `index.html`. Sau khi triển khai, thêm tên miền vào **Authentication → Settings → Authorized domains**, nếu không đăng nhập Google sẽ báo tên miền chưa được cấp phép.

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

Dữ liệu mỗi người dùng nằm riêng dưới `users/{uid}`, nên Firestore Rules chỉ cần kiểm tra `request.auth.uid == uid`.

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
  components/      layout, form, menu xuất, vuốt thẻ, logo...
    ui/            thành phần nền tảng: Button, Modal, Sheet, ConfirmDialog, Segmented...
  context/         Auth, Theme (chế độ + màu), Appearance (cỡ chữ + font), Lang, Toast
  hooks/           hook Firestore realtime, lớp phủ, media query, vị trí cuộn, cài PWA
  i18n/            vi.js, en.js và kho translate() dùng chung
  lib/             khởi tạo Firebase
  pages/           Login, TimeStreaks, StreakPosts, Statistics, Settings
  theme/           palette.js (vai trò màu Material), fonts.js, brand.js (hình học logo), defaults.css
  utils/           kiểm tra dữ liệu, nhập, xuất, thống kê, báo cáo PDF, ripple
scripts/           generate-icons.mjs (favicon, icon ứng dụng, ảnh splash)
firestore.rules    quy tắc bảo mật Firestore
```

## PWA và màn hình chờ

- **Icon và favicon** được sinh từ một định nghĩa logo duy nhất (`src/theme/brand.js`) bằng `npm run icons`, nên favicon, icon ứng dụng, ảnh splash và logo ở header, sidebar luôn giống hệt nhau.
- **Splash và thanh trạng thái** khớp màu nền ứng dụng: `#FEF7FF` ở giao diện sáng, `#15121C` ở giao diện tối. Thẻ meta theme-color theo màu `surface` đang dùng nên thanh trạng thái trên mobile liền mạch với header.
- Ảnh splash iOS nằm trong `public/splash`; Android đọc `manifest.webmanifest` hoặc `manifest-dark.webmanifest`; khung chờ trong `index.html` cũng theo giao diện đã lưu.
- Hệ điều hành tự đọc ảnh splash và màu manifest, không đọc được lựa chọn giao diện trong ứng dụng. Sau khi đổi icon, hãy gỡ rồi cài lại ứng dụng để thấy thay đổi.

## Lệnh

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển |
| `npm run build` | Build production (có service worker) |
| `npm run preview` | Xem thử bản build |
| `npm run lint` | Kiểm tra mã bằng oxlint |
| `npm run icons` | Sinh lại favicon, icon ứng dụng và ảnh splash |

## Tác giả

Thiết kế và phát triển bởi **[minhtrong67](https://github.com/minhtrong67)**, với sự hỗ trợ của AI: **Claude (Anthropic)**.
