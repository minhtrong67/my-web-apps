# Calendar Pro

<p>
  <a href="#tiếng-việt">🇻🇳 Tiếng Việt</a> ・ <a href="#english">🇬🇧 English</a>
</p>

Ứng dụng web tra cứu lịch âm dương & lịch vạn niên Việt Nam, thiết kế theo phong cách **Modern Minimalist**. <br/>
A Vietnamese lunar/solar calendar & perpetual almanac web app, designed in a **modern minimalist** style.

> Thiết kế &amp; phát triển bởi / Designed &amp; built by **minhtrong67**

---

## Tiếng Việt

### ✨ Tính năng chính

- **Lịch âm dương**: xem lịch theo tháng, mỗi ngày hiển thị cả ngày dương và ngày âm, đánh dấu ngày rằm, mùng một, ngày chay, ngày lễ.
- **Lịch vạn niên**: tra cứu chi tiết một ngày bất kỳ — Can Chi ngày/tháng/năm, con giáp, giờ hoàng đạo; quy đổi qua lại giữa dương lịch và âm lịch.
- **Đếm ngược ngày lễ**: danh sách các ngày lễ, kỷ niệm nổi bật ở Việt Nam (Tết Nguyên Đán, Giỗ Tổ Hùng Vương, Quốc khánh, Trung Thu...) với đồng hồ đếm ngược thời gian thực, lọc theo danh mục.
- **Ngày chay &amp; ngày rằm**: tự động đánh dấu 2 ngày ăn chay theo "Nhị trai" (Mùng Một &amp; Rằm) trong lịch, làm nổi bật khi xem chi tiết ngày.
- **Đa ngôn ngữ**: chuyển đổi liền mạch giữa Tiếng Việt và English cho toàn bộ ứng dụng, lưu lựa chọn vào trình duyệt.
- **Cài đặt giao diện**: chế độ Sáng/Tối/Hệ thống, 9 màu nhấn (mặc định **Hồng Rose** `#FF2056`; có chế độ đổi màu mỗi ngày), 4 cỡ chữ co giãn toàn ứng dụng, font hệ thống **system-ui** và bộ icon **Google Material Symbols** (chỉ tải đúng các icon đang dùng).
- **Tìm kiếm nhanh**: mở bảng lệnh điều hướng bằng `Ctrl/Cmd + K` để nhảy tới bất kỳ trang nào.
- **Thông báo nhắc nhở**: bật thông báo trình duyệt cho ngày chay và các ngày lễ tự chọn, tuỳ chỉnh giờ:phút gửi và chế độ nhắc đúng ngày hoặc báo trước N ngày.
- **PWA**: có thẻ cài đặt riêng trong trang Cài đặt, có thể "Cài đặt vào màn hình chính" trên điện thoại/máy tính, hoạt động ngoại tuyến nhờ Service Worker.
- Trải nghiệm mượt: loading skeleton, hộp thoại xác nhận trước hành động quan trọng, toast thông báo, responsive chuẩn cho PC/tablet/mobile (mobile có thanh điều hướng dưới + ngăn kéo menu riêng).

### 🧱 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework UI | ReactJS 18 + React Router (Hash) |
| Styling | TailwindCSS 3, phong cách minimalist (token màu trung tính, viền mảnh) |
| Icon | Google Material Symbols (Outlined) |
| Font | system-ui (font giao diện của hệ điều hành, không tải thêm file) |
| Build tool | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Đa ngôn ngữ | Từ điển nội bộ (vi/en), lưu vào localStorage |
| Thuật toán âm lịch | Thuật toán thiên văn Hồ Ngọc Đức |

### 📁 Cấu trúc thư mục

```
calendar-pro/
├── public/
│   ├── favicon.svg, favicon.png
│   └── icons/                 # App icon PWA (192/512/maskable)
├── src/
│   ├── components/            # Layout, Sidebar, BottomNav, Header, CommandPalette, ConfirmDialog...
│   ├── contexts/               # SettingsContext (giao diện + ngôn ngữ), ToastContext
│   ├── data/holidays.js        # Danh sách ngày lễ & ngày chay
│   ├── hooks/                  # useNow, useReminders, usePwaInstall
│   ├── i18n/                   # translations.js, useTranslation.js
│   ├── lib/lunar.js            # Thuật toán chuyển đổi âm dương lịch
│   ├── lib/dateUtils.js, iconMap.js
│   ├── pages/                  # HomePage, CalendarPage, VanNienPage, CountdownPage, SettingsPage
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### 🚀 Bắt đầu

Yêu cầu: Node.js ≥ 18.

```bash
npm install       # Cài đặt các gói phụ thuộc
npm run dev       # Chạy môi trường phát triển
npm run build     # Build bản production
npm run preview   # Xem thử bản production
```

Sau khi chạy `npm run dev`, mở trình duyệt tại địa chỉ được hiển thị (mặc định `http://localhost:5173`).

### 📱 Cài đặt như ứng dụng (PWA)

Sau khi build và deploy (hoặc chạy `npm run preview`), vào trang **Cài đặt** trong ứng dụng — nếu trình duyệt hỗ trợ, thẻ "Cài đặt ứng dụng" sẽ xuất hiện với nút cài đặt trực tiếp. Ứng dụng hoạt động cả khi ngoại tuyến nhờ Service Worker.

### 🎨 Tuỳ chỉnh giao diện

Vào trang **Cài đặt** trong ứng dụng để:
- Chuyển chế độ Sáng / Tối / Theo hệ thống
- Đổi ngôn ngữ Tiếng Việt / English
- Chọn màu nhấn: Đơn sắc, Đỏ Son, Vàng Kim, Xanh Ngọc, Xanh Dương, Tím Huế, Hồng Đào, Cam Sen, Ngọc Lam (hoặc bật "Đổi màu ngẫu nhiên mỗi ngày")
- Chọn cỡ chữ: Nhỏ / Vừa / Lớn / Rất lớn

Các tuỳ chỉnh được lưu tự động vào `localStorage` của trình duyệt.

### ⚠️ Lưu ý về dữ liệu

- Thuật toán chuyển đổi âm–dương lịch dựa trên múi giờ GMT+7, độ chính xác cao cho các năm hiện đại.
- Danh sách ngày chay mặc định theo **Nhị trai** (Mùng Một &amp; Rằm hàng tháng âm lịch) — cách tính phổ biến nhất; có thể khác với lịch chay của từng tông phái/cá nhân.
- Danh sách ngày lễ tổng hợp các ngày lễ, kỷ niệm phổ biến, mang tính tham khảo.

### 📄 Giấy phép

Dự án được xây dựng cho mục đích học tập/tham khảo cá nhân.

---

## English

### ✨ Key features

- **Solar/Lunar calendar**: monthly view showing both solar and lunar dates for every day, with full moon, new moon, vegetarian day and holiday markers.
- **Perpetual almanac**: look up detailed info for any date — day/month/year Can Chi, zodiac animal, auspicious hours; convert between solar and lunar dates.
- **Holiday countdown**: a list of Vietnam's notable holidays and anniversaries (Lunar New Year, Hung Kings' Temple Festival, National Day, Mid-Autumn Festival...) with a live countdown, filterable by category.
- **Vegetarian & full moon days**: automatically marks the two traditional monthly fasting days (1st & 15th of the lunar month), highlighted in the day detail view.
- **Multi-language**: seamless switching between Vietnamese and English across the entire app, with the choice saved in the browser.
- **Minimalist theming**: Light/Dark/System mode, 9 accent colors (default **Rose** `#FF2056`, with a daily-color option), 4 font-size scales, system-ui font and thin-stroke Material Symbols icons (subset-loaded).
- **Quick search**: open the command palette with `Ctrl/Cmd + K` to jump to any page.
- **Reminder notifications**: enable browser notifications for vegetarian days and chosen holidays, with a custom time and either same-day or N-days-in-advance reminders.
- **PWA**: a dedicated install card on the Settings page, installable to the home screen on mobile/desktop, and works offline via a Service Worker.
- Polished experience: loading skeletons, confirm dialogs before important actions, toast notifications, and solid responsiveness across desktop/tablet/mobile (mobile ships with a bottom nav bar and its own drawer menu).

### 🧱 Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + React Router (Hash) |
| Styling | TailwindCSS 3, minimalist style (neutral tokens, hairline borders) |
| Icons | Google Material Symbols (Outlined) |
| Font | system-ui (OS UI font, no extra download) |
| Build tool | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| i18n | In-app dictionary (vi/en), persisted to localStorage |
| Lunar algorithm | Hồ Ngọc Đức's astronomical algorithm |

### 📁 Project structure

```
calendar-pro/
├── public/
│   ├── favicon.svg, favicon.png
│   └── icons/                 # PWA app icons (192/512/maskable)
├── src/
│   ├── components/            # Layout, Sidebar, BottomNav, Header, CommandPalette, ConfirmDialog...
│   ├── contexts/               # SettingsContext (theme + language), ToastContext
│   ├── data/holidays.js        # Holiday & vegetarian-day data
│   ├── hooks/                  # useNow, useReminders, usePwaInstall
│   ├── i18n/                   # translations.js, useTranslation.js
│   ├── lib/lunar.js            # Solar/lunar conversion algorithm
│   ├── lib/dateUtils.js, iconMap.js
│   ├── pages/                  # HomePage, CalendarPage, VanNienPage, CountdownPage, SettingsPage
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### 🚀 Getting started

Requirements: Node.js ≥ 18.

```bash
npm install       # Install dependencies
npm run dev       # Start the dev server
npm run build     # Build for production
npm run preview   # Preview the production build
```

After `npm run dev`, open the URL printed in your terminal (defaults to `http://localhost:5173`).

### 📱 Install as an app (PWA)

After building and deploying (or running `npm run preview`), open the **Settings** page in the app — if your browser supports it, an "Install app" card will appear with a one-tap install button. The app works offline thanks to its Service Worker.

### 🎨 Customizing the look

Open the **Settings** page in the app to:
- Switch between Light / Dark / System mode
- Switch language between Vietnamese / English
- Pick an accent: Mono, Đỏ Son, Vàng Kim, Xanh Ngọc, Xanh Dương, Tím Huế, Hồng Đào, Cam Sen, Ngọc Lam (or enable "randomize color daily")
- Choose a font size: Small / Medium / Large / Extra large

All customizations are saved automatically to the browser's `localStorage`.

### ⚠️ Data notes

- The solar/lunar conversion algorithm is based on the GMT+7 timezone and is highly accurate for modern years.
- The default vegetarian-day list follows **Nhị trai** (the 1st & 15th of the lunar month) — the most common convention; it may differ from the fasting calendar of a specific school of thought or individual practice.
- The holiday list is a compilation of common Vietnamese holidays and observances, provided for reference.

### 📄 License

Built for personal learning/reference purposes.

---

**Tác giả / Author:** minhtrong67

---

## Tuỳ chỉnh theme / Theming

Toàn bộ màu nằm ở biến CSS trong `src/index.css` (bề mặt trung tính + thang `--accent-*` cho từng màu nhấn); chỉnh ở đó là đổi toàn app. Nền khởi động PWA được đặt trong `index.html` (khối `boot-style`) và `vite.config.js` (manifest) — đổi màu nền thì sửa cả ba nơi.

Responsive: `<640px` thanh dưới + menu trượt · `640–1023px` thanh dọc gọn · `≥1024px` sidebar · `≥1280px` chi tiết ngày cạnh lưới tháng.
