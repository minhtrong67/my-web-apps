<div align="center">
  <img src="public/pwa-192.png" width="96" alt="Personal Keep logo"/>

  # Personal Keep

  **Một nơi để lưu giữ dự án vibe code, tài khoản Google, trang web hữu ích, prompt và API key.**

  [Landing page](public/landing.html) · [Báo lỗi / góp ý](../../issues)

  ![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-ffca28?logo=firebase&logoColor=black)
  ![Material 3](https://img.shields.io/badge/Material_3-Expressive-6750a4?logo=materialdesign&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

## Giới thiệu
**Personal Keep** (trước đây là Project Tracker) là web app cá nhân gom những thứ bạn hay phải nhớ vào một nơi duy nhất. Ứng dụng chia thành ba module độc lập, mỗi module có danh sách, danh mục và thống kê riêng. Giao diện theo **Material 3 Expressive**, dùng tốt trên máy tính lẫn điện thoại, cài được như một app (PWA), hỗ trợ tiếng Việt và English.

## Screenshot
| Dự án | Trang web | Prompt | Thống kê |
| :---: | :---: | :---: | :---: |
| ![Dự án](screenshots/image01.png) | ![Trang web](screenshots/image02.png) | ![Prompt](screenshots/image03.png) | ![Thống kê](screenshots/image04.png) |

## Module và tính năng

### Dự án
- **Dự án**: tên, mô tả, trạng thái (Đang làm / Tạm dừng / Hoàn thành / Huỷ), danh mục, hashtag, công cụ AI vibe code, gán nhiều tài khoản
- **Chọn hàng loạt**: chọn tất cả hoặc từng dự án để **cập nhật trạng thái** hay **xoá** trong một lần (có hộp thoại xác nhận)
- **Tài khoản**: tên, email Google, ghi chú; xem tài khoản đang tham gia dự án nào
- **Thống kê** riêng (luôn tính toàn bộ dữ liệu, không bộ lọc): thẻ số liệu, biểu đồ tròn theo danh mục, công cụ, tài khoản, hashtag và thanh tiến độ %

### Trang web
- **Trang web**: lưu tên, đường dẫn, danh mục, mô tả; hiện favicon, mở tab mới, sao chép liên kết; chặn trùng đường dẫn và chỉ nhận `http` / `https`
- **Danh mục** tự tạo, mỗi danh mục một màu; xoá danh mục thì mục liên quan chuyển thành "Chưa phân loại"
- **Thống kê** riêng: theo danh mục, tên miền xuất hiện nhiều, thêm gần đây
- Kèm sẵn **88 trang web** (`src/seed-websites.json`), thêm bằng một lần nhấn, không bị nhân đôi khi thêm lại

### Prompt
- **Prompt**: tiêu đề, danh mục, hashtag, nội dung dài (tối đa 10.000 ký tự), xem nhanh và **sao chép một chạm**
- **Danh mục** tự tạo như module Trang web
- **API Key** (mini module): nhà cung cấp, tên gợi nhớ, ghi chú; key được che mờ, hiện khi cần và tự ẩn sau 20 giây
- **Thống kê** riêng: theo danh mục, nhà cung cấp, hashtag, prompt dài nhất

### Dùng chung
- Tìm kiếm, lọc, sắp xếp, xem dạng lưới / danh sách; bộ lọc được nhớ trong phiên
- **Nhập / xuất** CSV, JSON, Excel (và PDF, PNG cho báo cáo): nhập lại ghi đè dữ liệu trùng, không tạo bản sao. **API key không bao giờ được xuất**
- Thẻ item thống nhất cho cả dạng lưới và danh sách (trên laptop trở lên, danh sách là các hàng có cột thẳng hàng); phần dư của nhãn được gộp thành `+n`
- Command palette `Ctrl + K`, phím tắt `N` (thêm mới) và `/` (tìm kiếm), nút lên đầu trang cuộn mượt, tooltip tuỳ chỉnh cho mọi nút biểu tượng
- Sidebar có khối người dùng ở cuối: ảnh, họ tên, email và nút đăng xuất (có xác nhận)
- Hiệu ứng: ripple khi bấm, hình khối co lại khi nhấn, số đếm lên và thanh tiến độ / biểu đồ tròn chạy khi hiện, tôn trọng `prefers-reduced-motion`
- Thông tin tác giả chỉ hiển thị trong Cài đặt
- Thêm mới dùng dialog (form ngắn) hoặc sheet toàn màn hình (form dài); **sửa và xoá đều có hộp thoại xác nhận**; nền phía sau dialog được làm tối và mờ
- Toast 4 biến thể (info, success, warning, error) theo giao diện sáng / tối, chỉ dùng khi thật cần
- Dropdown tự dựng (không dùng `<select>` mặc định), giới hạn chiều cao và có thanh cuộn

### Cài đặt
| Mục | Lựa chọn |
| --- | --- |
| Chế độ hiển thị | Sáng · Tối · Theo hệ thống |
| Ngôn ngữ | Tiếng Việt · English |
| Cỡ chữ | Nhỏ · Vừa · Lớn |
| Màu chủ đề (accordion) | 19 màu Material Design: Red, Pink, Purple, Deep Purple, Indigo, Blue, Light Blue, Cyan, Teal, Green, Light Green, Lime, Yellow, Amber, Orange, Deep Orange, Brown, Grey, Blue Grey (lưới 5 cột cân đối) |
| Phông chữ (accordion + dropdown) | System (mặc định) · Google Sans Flex · Roboto Flex · Roboto · Arial · Inter · Be Vietnam Pro |
| Trang mặc định khi mở app | Bất kỳ trang con nào của 3 module hoặc Cài đặt |

Ngoài ra: sao lưu / khôi phục JSON, nút **Xem landing page**, cài PWA, thông tin tác giả. Màu cũ trong bản trước (violet, sky, emerald, rose) được tự chuyển sang màu Material gần nhất.

## Cài đặt dự án
Yêu cầu: Node.js 18+ và một project Firebase.

```bash
git clone <repo-url> personal-keep
cd personal-keep
npm install
cp .env.example .env   # điền Firebase config
npm run dev
```

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm Web app và chép config vào `.env`.
2. Authentication → Sign-in method → bật **Google**.
3. Tạo **Firestore Database** với rules sau (bao phủ mọi collection của người dùng):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### Dữ liệu trên Firestore
`users/{uid}/` gồm các collection: `projects`, `accounts`, `websites`, `wcategories`, `prompts`, `pcategories`, `apikeys`. Danh mục mặc định được tạo tự động ở lần đầu mở module tương ứng. Dữ liệu từ bản Project Tracker cũ (dự án, tài khoản, trang web) dùng tiếp được, không cần di chuyển.

> **Về bảo mật API key**: key được lưu trong Firestore của chính bạn và chỉ tài khoản của bạn đọc được theo rules ở trên, nhưng **không mã hoá đầu cuối**. Đừng lưu key quyền cao hoặc key production.

## Thiết kế
**Material 3 Expressive**: bảng màu tông sinh bằng `@material/material-color-utilities` cho 19 màu chủ đề (mỗi màu có bản sáng và tối, file `src/theme.css`), bo góc lớn, nút viên thuốc co góc khi nhấn (shape morph), hình cookie 9 thuỳ cho logo và icon, chip lọc, navigation bar có chỉ báo viên thuốc, text field outlined có nhãn nổi, slider dày, chuyển động có độ nảy. Mọi màu đi qua token CSS nên đổi màu chủ đề là đổi cả app.

## Landing page
`public/landing.html` là một file HTML duy nhất, không cần build: sáng / tối / hệ thống, tiếng Việt / English, đổi màu chủ đề, hoạt ảnh, responsive, thẻ SEO và chia sẻ mạng xã hội đầy đủ. Truy cập tại `/landing.html` hoặc từ nút **Xem landing page** trong Cài đặt. Landing dùng chung khoá `settings` với app nên luôn khớp màu và chế độ bạn đã chọn.

Trước khi triển khai, hãy thay `https://personal-keep.vercel.app` bằng domain thật trong `public/landing.html`, `public/robots.txt` và `public/sitemap.xml`.

## Xử lý sự cố
- **Trang Thống kê báo `ERR_BLOCKED_BY_CLIENT` hoặc "Failed to fetch dynamically imported module"**: trình chặn quảng cáo / theo dõi đang chặn file có tên chứa từ "stats". Các trang thống kê đã được đặt tên `*Overview` để tránh việc này; nếu vẫn gặp lỗi tương tự, hãy tắt trình chặn cho trang web rồi tải lại. Mỗi trang đều có khung bắt lỗi với nút **Thử lại** và **Tải lại trang**.
- **Favicon không hiện**: favicon lấy qua dịch vụ của Google theo tên miền; khi offline hoặc tên miền không có favicon, thẻ tự dùng chữ cái đầu.

## Tech stack
React 18 · Vite 6 · Tailwind CSS 4 · Firebase (Auth, Firestore) · Lucide Icons · ExcelJS · jsPDF · html-to-image · vite-plugin-pwa

## Scripts
```bash
npm run dev       # chạy dev tại http://localhost:5173
npm run build     # build ra dist/
npm run preview   # xem thử bản build
```
Triển khai `dist/` lên Firebase Hosting, Vercel hoặc Netlify (cần HTTPS để cài PWA, và thêm domain vào *Authorized domains* của Firebase Auth).

## Cấu trúc project
```
personal-keep/
├── public/                  # icon PWA, landing.html, og-image.png, robots.txt, sitemap.xml
├── screenshots/             # image01 … image04 cho README
├── src/
│   ├── pages/               # Projects, Accounts, ProjectOverview, Websites, WebOverview,
│   │                        # Categories, Prompts, ApiKeys, PromptOverview, Settings
│   ├── components/          # Toolbar, forms (dialog / sheet), charts (biểu đồ tròn + tiến độ), OverviewKit
│   ├── Shell.jsx            # điều hướng theo module, tab con, Ctrl+K
│   ├── routes.js            # khai báo module -> trang con
│   ├── data.jsx             # Firestore realtime, CRUD, thao tác hàng loạt, nhập upsert
│   ├── transfer.js · io.js  # chuẩn hoá và xuất / nhập CSV, JSON, XLSX, PDF, PNG
│   ├── ui.jsx               # Button, Dialog, Confirm, Dropdown, Toast, Tooltip, ScrollTop...
│   ├── i18n.js · hooks.js   # từ điển vi / en, cài đặt, phông chữ, PWA
│   ├── theme.css            # 19 bảng màu M3 Expressive (tự sinh)
│   ├── accents.js           # danh sách 19 màu, cỡ chữ
│   └── index.css            # token và component
├── .env.example
└── vite.config.js
```

## License
Phát hành theo giấy phép [MIT](LICENSE).

---
<div align="center">Tác giả <b>minhtrong67</b> · Có sự hỗ trợ của <b>Claude</b> (Anthropic)</div>
