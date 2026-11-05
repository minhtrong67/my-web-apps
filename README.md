# minhtrong67 · Web Apps

**[English](./README.en.md) · Tiếng Việt**

<div align="center">

**Bộ sưu tập các ứng dụng web nhỏ được xây dựng để giải quyết những nhu cầu thực tế hằng ngày.**

React · Vite · Tailwind CSS · Firebase · PWA · Material 3 Expressive

[![GitHub repository](https://img.shields.io/badge/GitHub-minhtrong67%2Fmy--web--apps-181717?logo=github)](https://github.com/minhtrong67/my-web-apps)
[![Apps](https://img.shields.io/badge/apps-8-7C3AED)](https://github.com/minhtrong67/my-web-apps)
[![Author](https://img.shields.io/badge/author-minhtrong67-0D9488)](https://github.com/minhtrong67)

</div>

## Giới thiệu

`my-web-apps` là một monorepo chứa các ứng dụng web độc lập của **minhtrong67**. Mỗi thư mục con là một dự án có `package.json`, cấu hình build và README riêng, vì vậy có thể phát triển hoặc triển khai từng app mà không ảnh hưởng đến các app còn lại.

Các dự án tập trung vào trải nghiệm sử dụng thực tế: giao diện responsive, hỗ trợ tiếng Việt và English, khả năng cài đặt như ứng dụng native thông qua PWA, cùng hệ thống thiết kế Material 3 Expressive được điều chỉnh theo từng sản phẩm.

> Repository này hiện chứa **8 ứng dụng web**. Một số app yêu cầu Firebase Authentication và Cloud Firestore; hãy xem phần cấu hình của từng app trước khi chạy.

## Danh mục ứng dụng

| Ứng dụng | Mô tả | Công nghệ / ghi chú |
| --- | --- | --- |
| [**BA List**](./ba-list) | Tra cứu học sinh Blue Archive với tìm kiếm thông minh, bộ lọc, trang chi tiết và chế độ offline. | React 19 · Vite · Tailwind CSS · PWA |
| [**Calendar Pro**](./calendar-pro) | Lịch âm dương và lịch vạn niên Việt Nam, Can Chi, giờ hoàng đạo, ngày lễ và bộ đếm ngược. | React 18 · Vite · Tailwind CSS · Vitest |
| [**Expenser**](./expenser) | Theo dõi thu chi cá nhân với nhiều ví, danh mục, biểu đồ, nhắc nhở và đồng bộ dữ liệu. | React 19 · Vite · Firebase · Recharts · PWA |
| [**Moody**](./moody) | Nhật ký tâm trạng với check-in 5 mức, hoạt động, lịch, xu hướng và báo cáo. | React 18 · Vite · Firebase · Recharts · PWA |
| [**Personal Keep**](./personal-keep) | Lưu giữ và quản lý dự án, tài khoản, website, prompt và API key cá nhân. | React 18 · Vite · Firebase · PWA |
| [**Sayuri Vault**](./sayuri-vault) | Kho dữ liệu cá nhân dạng module với tìm kiếm, phân loại, nhập/xuất và mã hóa mật khẩu trong trình duyệt. | React 19 · Vite · Firebase · Tailwind CSS |
| [**Streak Logger**](./streak-logger) | Theo dõi thời gian từ một mốc cá nhân, nhật ký streak, thống kê và xuất báo cáo. | React 19 · Vite · Firebase · Recharts · PWA |
| [**Wifi Vault**](./wifi-vault) | Lưu trữ, tìm kiếm, phân loại và sao lưu mật khẩu Wi-Fi. | React 18 · Vite · Firebase · Recharts · PWA |

Mỗi app có README riêng với thông tin chi tiết hơn về tính năng, ảnh chụp màn hình, cấu trúc dữ liệu và hướng dẫn triển khai.

## Công nghệ dùng chung

- **Frontend:** React và React DOM.
- **Build tool:** Vite.
- **Styling:** Tailwind CSS và CSS variables theo Material 3 Expressive.
- **Backend và xác thực:** Firebase Authentication và Cloud Firestore ở các app cần đồng bộ dữ liệu.
- **PWA:** `vite-plugin-pwa`, service worker và web manifest cho các app hỗ trợ cài đặt.
- **Biểu đồ và báo cáo:** Recharts, jsPDF, SheetJS và các thư viện xuất dữ liệu phù hợp với từng app.
- **Icons:** Lucide Icons và bộ icon riêng của từng sản phẩm.

Các phiên bản dependency có thể khác nhau giữa các app. Luôn chạy lệnh trong đúng thư mục dự án thay vì ở thư mục gốc repository.

## Bắt đầu nhanh

### Yêu cầu

- Node.js 18 trở lên.
- npm 9 trở lên hoặc phiên bản npm đi kèm Node.js.
- Firebase project nếu ứng dụng có file `.env.example`.

### Chạy một ứng dụng

Ví dụ với `wifi-vault`:

```bash
git clone https://github.com/minhtrong67/my-web-apps.git
cd my-web-apps/wifi-vault
npm install
npm run dev
```

Sau đó mở URL development được Vite hiển thị trong terminal, thường là `http://localhost:5173`.

Thay `wifi-vault` bằng tên thư mục của app bạn muốn chạy:

```bash
cd ba-list
cd calendar-pro
cd expenser
cd moody
cd personal-keep
cd sayuri-vault
cd streak-logger
cd wifi-vault
```

Không chạy nhiều lệnh `cd` liên tiếp trong cùng một terminal; hãy chọn đúng một thư mục ứng dụng cho mỗi lần làm việc.

### Cấu hình Firebase

Các ứng dụng có file `.env.example` cần được cấu hình trước khi đăng nhập hoặc truy cập dữ liệu đồng bộ:

```bash
cp .env.example .env
```

Sau đó điền các biến Firebase Web App theo mẫu có sẵn trong `.env.example`. Thông thường quy trình gồm:

1. Tạo hoặc chọn project trong [Firebase Console](https://console.firebase.google.com).
2. Thêm một Web App và sao chép cấu hình vào `.env`.
3. Bật Google trong **Authentication → Sign-in method** nếu app sử dụng đăng nhập Google.
4. Tạo Cloud Firestore Database.
5. Áp dụng file `firestore.rules` đi kèm app nếu file này tồn tại.
6. Khi deploy, thêm domain production vào danh sách **Authorized domains** của Firebase Authentication.

Không commit file `.env` hoặc bất kỳ secret nào vào Git. Firebase client configuration có thể xuất hiện ở phía frontend, nhưng quyền truy cập dữ liệu vẫn phải được bảo vệ bằng Firestore Rules và kiểm tra người dùng ở phía server.

### Các lệnh thường dùng

Chạy trong thư mục của từng ứng dụng:

```bash
npm run dev       # Môi trường phát triển
npm run build     # Build production vào dist/
npm run preview   # Xem thử bản build production
```

Một số dự án có thêm lệnh riêng như `lint`, `test`, `icons`, `theme` hoặc kiểm tra i18n. Chạy `npm run` để xem toàn bộ script được hỗ trợ bởi app hiện tại.

## Build và triển khai

Mỗi app được build độc lập:

```bash
cd <ten-ung-dung>
npm install
npm run build
```

Kết quả nằm trong thư mục `dist/` và có thể triển khai lên Firebase Hosting, Vercel, Netlify hoặc static hosting tương thích với SPA. Với các app dùng React Router, máy chủ cần rewrite các route chưa biết về `index.html`.

Khi triển khai app có Firebase:

- Cấu hình các biến môi trường production trên nền tảng hosting.
- Thêm domain đã deploy vào **Authorized domains**.
- Kiểm tra lại Firestore Rules trước khi mở quyền truy cập công khai.
- Không dùng Firestore Rules mẫu của app này cho một dự án khác nếu chưa hiểu rõ mô hình dữ liệu và quyền truy cập.

## Cấu trúc repository

```text
my-web-apps/
├── ba-list/          # Tra cứu học sinh Blue Archive
├── calendar-pro/     # Lịch âm dương và vạn niên Việt Nam
├── expenser/         # Theo dõi thu chi cá nhân
├── moody/            # Nhật ký tâm trạng
├── personal-keep/    # Quản lý dự án, tài khoản, website và prompt
├── sayuri-vault/     # Kho dữ liệu cá nhân dạng module
├── streak-logger/    # Theo dõi streak và nhật ký mốc thời gian
├── wifi-vault/       # Quản lý mật khẩu Wi-Fi
├── index.html        # Trang giới thiệu bộ sưu tập web app
├── README.md         # Tài liệu tiếng Việt
└── README.en.md      # English documentation
```

Mỗi app thường có cấu trúc riêng gồm `src/`, `public/`, `package.json`, file cấu hình Vite và README. Không nên dùng chung `node_modules` hoặc file `.env` giữa các app.

## Quy ước phát triển

- Thay đổi trong một app nên được giới hạn trong thư mục của app đó.
- Cập nhật README riêng khi thay đổi tính năng, biến môi trường hoặc lệnh build.
- Dùng tiếng Việt hoặc English nhất quán với hệ thống i18n của ứng dụng.
- Kiểm tra responsive trên mobile và desktop trước khi merge.
- Chạy `npm run build` và các lệnh `lint` / `test` nếu app có cung cấp trước khi tạo pull request.
- Không đưa dữ liệu cá nhân, API key thật, thông tin đăng nhập hoặc file export vào repository.

## Đóng góp

Nếu muốn đề xuất thay đổi hoặc báo lỗi:

1. Fork repository.
2. Tạo branch cho thay đổi của bạn:
   ```bash
   git checkout -b feat/ten-thay-doi
   ```
3. Chỉ chỉnh sửa các file liên quan đến app cần thay đổi.
4. Chạy build và kiểm tra phù hợp.
5. Tạo pull request với mô tả rõ mục tiêu, phạm vi thay đổi và cách kiểm thử.

## Tác giả

Thiết kế và phát triển bởi [**minhtrong67**](https://github.com/minhtrong67), với sự hỗ trợ của các công cụ AI trong quá trình nghiên cứu và phát triển.

- GitHub: [github.com/minhtrong67](https://github.com/minhtrong67)
- Repository: [minhtrong67/my-web-apps](https://github.com/minhtrong67/my-web-apps)

## Giấy phép

Giấy phép có thể khác nhau giữa các ứng dụng. Hãy xem file `LICENSE` hoặc phần **License** trong README của từng app trước khi sử dụng, sao chép hoặc phân phối lại mã nguồn.
