<div align="center">
  <img src="public/pwa-192.png" width="88" alt="Personal Keep logo"/>

  # Personal Keep

  **Nơi lưu giữ dự án vibe code, tài khoản Google và những trang web hữu ích bạn tìm được trên mạng.**

  ![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-11-ffca28?logo=firebase&logoColor=black)
  ![Material 3](https://img.shields.io/badge/Material_3-Expressive-6750a4?logo=materialdesign&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-ready-6366f1)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

## Giới thiệu
**Personal Keep** (trước đây là Project Tracker) là web app cá nhân gom mọi thứ bạn cần ghi nhớ vào một nơi: dự án đang vibe code, tài khoản Google gắn với từng dự án, và kho trang web hữu ích bạn lưu lại để dùng về sau. Dùng mượt trên máy tính lẫn điện thoại (PWA), hỗ trợ tiếng Việt và tiếng Anh.

## Screenshot
| Dự án | Tài khoản | Trang web | Thống kê |
| :---: | :---: | :---: | :---: |
| ![Dự án](screenshots/image01.png) | ![Tài khoản](screenshots/image02.png) | ![Trang web](screenshots/image03.png) | ![Thống kê](screenshots/image04.png) |

## Tính năng
- **Quản lý dự án**: tên, mô tả, trạng thái (Đang làm / Tạm dừng / Hoàn thành / Huỷ), danh mục, hashtag công nghệ, công cụ AI vibe code, gán nhiều tài khoản
- **Quản lý tài khoản**: tên, email Google, ghi chú; xem tài khoản đang tham gia dự án nào
- **Quản lý trang web** (mới): lưu trang web hữu ích với tên, đường dẫn, danh mục (Công cụ, Tiện ích, Extension, App di động, App máy tính, Khác) và mô tả; hiện favicon, mở trang ở tab mới, sao chép liên kết; chặn trùng đường dẫn và chỉ nhận `http` / `https`
- **Danh sách trang web có sẵn**: kèm 88 trang web từ file `utilities-vault`, thêm bằng một lần nhấn ở trang Trang web hoặc trong Cài đặt (trùng đường dẫn thì không bị nhân đôi)
- **Tìm kiếm, lọc, sắp xếp, xoá lọc**; bộ lọc từng trang được nhớ bằng `sessionStorage`
- **Dạng danh sách / lưới** cho mọi danh sách dữ liệu
- **Nhập / xuất** (trong Cài đặt, cho Dự án, Tài khoản và Trang web): nhập CSV, JSON, XLSX (trùng dữ liệu thì ghi đè, không nhân đôi); xuất CSV, JSON, XLSX, PDF, PNG với màu theo chủ đề đang dùng
- **Thống kê**: thẻ số liệu, biểu đồ cột và biểu đồ tròn có đầy đủ nhãn (gồm cả trang web theo danh mục), lọc theo ngày / tuần / tháng / năm, xuất báo cáo PDF / PNG
- **Cài đặt**: giao diện sáng / tối / hệ thống, ngôn ngữ, cỡ chữ, 8 màu chủ đề, trang mở mặc định, sao lưu / khôi phục dữ liệu, khôi phục mặc định
- **PWA** cài được trên điện thoại, có thẻ cài đặt nổi bật trong Cài đặt
- Đăng nhập Google, đồng bộ realtime với Firestore, dữ liệu tách riêng theo từng người dùng
- **Hiệu năng**: tách bundle theo trang, Firestore chỉ nạp sau khi đăng nhập, thư viện xuất file nạp khi cần, cache IndexedDB để mở lại là có dữ liệu ngay
- Command palette `Ctrl + K` (tìm trang, dự án, tài khoản, trang web), thanh điều hướng dưới và drawer trên mobile, form kiểm tra dữ liệu chặt chẽ, skeleton loading

## Cài đặt
Yêu cầu: Node.js 18+ và một project Firebase.

```bash
git clone <repo-url> personal-keep
cd personal-keep
npm install
cp .env.example .env   # rồi điền Firebase config
```

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm Web app và chép config vào `.env`.
2. Authentication → Sign-in method → bật **Google**.
3. Tạo **Firestore Database** và dùng rules sau (đã bao gồm collection `websites`):
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

> Đang dùng bản Project Tracker cũ? Dữ liệu dự án và tài khoản giữ nguyên, không cần di chuyển; mục trang web tự tạo collection mới khi bạn thêm.

## Thiết kế
Phong cách **Material 3 Expressive**: bảng màu tông (tonal palette) sinh bằng `@material/material-color-utilities` cho 8 màu chủ đề, mỗi màu có đủ bản sáng / tối (`src/theme.css`); bo góc lớn và mềm, nút dạng viên thuốc co góc khi nhấn (shape morph), chip lọc, navigation bar với chỉ báo viên thuốc, FAB, text field outlined có nhãn nổi, slider dày, hình cookie 9 thuỳ làm logo và icon, chuyển động có độ nảy (spring). Toàn bộ màu đi qua token CSS nên đổi màu chủ đề là đổi cả app.

## Tech stack
React 18 · Vite 6 · Tailwind CSS 4 · Firebase (Auth, Firestore) · Lucide Icons · ExcelJS · jsPDF · html-to-image · vite-plugin-pwa

## Development
```bash
npm run dev       # http://localhost:5173
npm run preview   # xem thử bản build
```

## Build
```bash
npm run build     # output trong dist/
```
Triển khai `dist/` lên Firebase Hosting, Vercel hoặc Netlify. Cần HTTPS để PWA cài đặt được, và thêm domain vào *Authorized domains* của Firebase Auth.

## Cấu trúc project
```
personal-keep/
├── public/              # favicon, app icon PWA (hình cookie M3 Expressive)
├── screenshots/         # ảnh README: image01 … image04
├── src/
│   ├── pages/           # Projects, Accounts, Websites, Stats, Settings
│   ├── components/      # Toolbar, forms, charts
│   ├── App.jsx          # đăng nhập, cài đặt, providers
│   ├── Shell.jsx        # header, sidebar, bottom bar, Ctrl+K
│   ├── data.jsx         # Firestore realtime + CRUD + import upsert
│   ├── transfer.js      # chuẩn hoá dữ liệu nhập / xuất
│   ├── io.js            # CSV, XLSX, PDF, PNG
│   ├── i18n.js          # từ điển vi / en
│   ├── hooks.js         # cài đặt, sessionStorage, PWA install
│   ├── ui.jsx           # Button, Dialog, Dropdown, Toast, Skeleton...
│   ├── seed-websites.json  # 88 trang web có sẵn (utilities-vault)
│   ├── theme.css        # bảng màu M3 Expressive (tự sinh)
│   └── index.css        # token + component M3 Expressive
├── .env.example
├── vite.config.js
└── LICENSE
```

## License
Phát hành theo giấy phép [MIT](LICENSE).

---
<div align="center">Tác giả <b>minhtrong67</b> · Có sự hỗ trợ của <b>Claude</b> (Anthropic)</div>
