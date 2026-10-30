# Calendar Pro

<p>
  <a href="#tiếng-việt">🇻🇳 Tiếng Việt</a> ・ <a href="#english">🇬🇧 English</a>
</p>

Ứng dụng web tra cứu lịch âm dương & lịch vạn niên Việt Nam, thiết kế theo chuẩn **Material 3 Expressive (2026)** với màu chủ đạo **Rose**. <br/>
A Vietnamese lunar/solar calendar & perpetual almanac web app, designed with **Material 3 Expressive (2026)** and a **Rose** primary color.

> Thiết kế &amp; phát triển bởi / Designed &amp; built by **minhtrong67**

<p align="center">
  <img src="screenshots/01-home.png" alt="Trang chủ — ngày âm lịch dạng số cuộn, sự kiện sắp tới" width="49%" />
  <img src="screenshots/02-calendar.png" alt="Lịch tháng (chế độ tối) — ngày chọn dạng cookie, chi tiết ngày bên phải" width="49%" />
  <img src="screenshots/03-countdown.png" alt="Đếm ngược sự kiện — thanh tiến trình dạng sóng, số cuộn" width="49%" />
  <img src="screenshots/04-settings.png" alt="Cài đặt — 10 màu chủ đạo và 7 phông chữ" width="49%" />
</p>

<p align="center"><sub>Trang chủ · Lịch tháng (tối) · Đếm ngược · Cài đặt màu &amp; phông chữ — ảnh chụp bằng <code>scripts/screenshots.py</code> với phông Google Sans Flex.</sub></p>

---

## Tiếng Việt

### ✨ Tính năng chính

- **Lịch âm dương**: xem lịch theo tháng, mỗi ngày hiển thị cả ngày dương và ngày âm, đánh dấu ngày rằm, mùng một, ngày chay, ngày lễ.
- **Lịch vạn niên**: tra cứu chi tiết một ngày bất kỳ — Can Chi ngày/tháng/năm, con giáp, giờ hoàng đạo; quy đổi qua lại giữa dương lịch và âm lịch.
- **Đếm ngược ngày lễ**: danh sách các ngày lễ, kỷ niệm nổi bật ở Việt Nam (Tết Nguyên Đán, Giỗ Tổ Hùng Vương, Quốc khánh, Trung Thu...) với đồng hồ đếm ngược thời gian thực, lọc theo danh mục.
- **Ngày chay &amp; ngày rằm**: tự động đánh dấu 2 ngày ăn chay theo "Nhị trai" (Mùng Một &amp; Rằm) trong lịch, làm nổi bật khi xem chi tiết ngày.
- **Đa ngôn ngữ**: chuyển đổi liền mạch giữa Tiếng Việt và English cho toàn bộ ứng dụng, lưu lựa chọn vào trình duyệt.
- **Tìm kiếm nhanh**: mở bảng lệnh điều hướng bằng `Ctrl/Cmd + K` để nhảy tới bất kỳ trang nào.
- **Thông báo nhắc nhở**: bật thông báo trình duyệt cho ngày chay và các ngày lễ tự chọn, tuỳ chỉnh giờ:phút gửi và chế độ nhắc đúng ngày hoặc báo trước N ngày.
- **PWA**: có thẻ cài đặt riêng trong trang Cài đặt, có thể "Cài đặt vào màn hình chính" trên điện thoại/máy tính, hoạt động ngoại tuyến nhờ Service Worker.

### 🎨 Material 3 Expressive (2026)

| Khía cạnh | Cách áp dụng |
|---|---|
| **Màu** | Bảng màu động (DynamicScheme dạng *vibrant*) sinh từ màu chủ đạo — mặc định **Rose** (seed `#FF2056` → primary `#BE003A`). Đủ vai trò primary / secondary / tertiary / surface-container, 4 chế độ: sáng, tối, sáng &amp; tối tương phản cao. Màu "chay" và "ngày lễ" được *harmonize* về màu chủ đạo. |
| **Hình dạng** | Bo góc lớn (28–48px), thẻ tonal không viền; icon ngày lễ và ngày đang chọn dùng các hình **cookie / scallop / flower / sunny**; nút "biến hình" khi nhấn; connected button group. |
| **Chuyển động** | Token **spring** (spatial / spatial-fast / spatial-slow) sinh thành `linear()` easing có độ nảy; màu &amp; độ trong suốt dùng đường cong không nảy. Tự tắt khi bật *giảm chuyển động*. |
| **Chữ** | Thang chữ Expressive (tiêu đề đậm, tracking âm) + chọn phông chữ trong Cài đặt. |
| **Điều hướng** | Sidebar với chỉ báo trượt bằng spring, navigation rail, thanh điều hướng dưới dạng nổi (floating) trên di động. |

**Hiệu ứng &amp; animation**

- Đổi tháng: các ô ngày nảy ra theo **làn sóng chéo**; ngày được chọn là hình **cookie** nảy ra và xoay.
- **Số cuộn** (odometer) cho đồng hồ đếm ngược và ngày âm lịch; **thanh tiến trình dạng sóng** (wavy) đang chảy.
- Đổi Sáng/Tối: giao diện mới **lan ra theo vòng tròn** từ điểm bấm (View Transitions API), đổi màu chủ đạo thì mọi bề mặt chuyển màu mượt.
- Loading indicator **biến hình** giữa các hình; ripple + state layer; ánh sáng **spotlight** đi theo con trỏ trên thẻ; hình trang trí xoay chậm; thẻ hiện dần khi cuộn (scroll-driven animation); toast / sheet / hộp thoại vào bằng spring.

### 🔤 Phông chữ

Vào **Cài đặt → Phông chữ** để chọn: **System** (mặc định) · **Google Sans Flex** · **Roboto Flex** · **Roboto** · **Arial** · **Inter** · **Be Vietnam Pro**. Tất cả đều đủ dấu tiếng Việt. Font web được tự host qua [Fontsource](https://fontsource.org) (không phụ thuộc CDN), chỉ tải khi chọn và được cache để dùng offline.

### 🧱 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework UI | ReactJS 18 + React Router (Hash) |
| Styling | TailwindCSS 3 + token Material 3 Expressive (màu, hình, spring) |
| Sinh theme | `@material/material-color-utilities` → `scripts/generate-theme.mjs` |
| Icon | Google Material Symbols (Outlined, tải đúng các icon đang dùng) |
| Font | System / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro (Fontsource) |
| Build tool | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Đa ngôn ngữ | Từ điển nội bộ (vi/en), lưu vào localStorage |
| Thuật toán âm lịch | Thuật toán thiên văn Hồ Ngọc Đức |

### 📁 Cấu trúc thư mục

```
calendar-pro/
├── public/
│   ├── favicon.svg, favicon.ico, favicon-*.png, og-image.png
│   └── icons/                 # App icon PWA (any / maskable / monochrome / apple-touch)
├── screenshots/               # 4 ảnh giới thiệu (README + landing)
├── landing/index.html         # Landing page tĩnh
├── scripts/
│   ├── generate-theme.mjs     # Sinh màu M3 Expressive + spring + hình dạng
│   ├── generate-icons.py      # Sinh favicon / app icon / og-image
│   └── screenshots.py         # Chụp 4 ảnh trong screenshots/
├── src/
│   ├── components/            # Layout, Sidebar, NavRail, BottomNav, RollingNumber, WavyProgress, Loader...
│   ├── contexts/              # SettingsContext (giao diện, màu, phông chữ, ngôn ngữ), ToastContext
│   ├── data/holidays.js       # Danh sách ngày lễ & ngày chay
│   ├── hooks/                 # useNow, useReminders, usePwaInstall
│   ├── i18n/                  # translations.js, useTranslation.js
│   ├── lib/                   # lunar.js, dateUtils.js, fonts.js, ripple.js, themeTransition.js
│   ├── pages/                 # HomePage, CalendarPage, VanNienPage, CountdownPage, SettingsPage
│   ├── theme/                 # colors.json (seed) + material-theme.css / motion.css / shapes.css (tự sinh)
│   ├── App.jsx, main.jsx, index.css
├── index.html, tailwind.config.js, vite.config.js, package.json
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

### 🛠️ Script hỗ trợ

```bash
npm run theme        # Sinh lại bảng màu / spring / shape từ src/theme/colors.json
npm run icons        # Sinh lại favicon, app icon, og-image   (Python + Playwright + Pillow)
npm run build && npm run screenshots   # Chụp lại 4 ảnh trong screenshots/ (Python + Playwright)
```

Đổi màu chủ đạo mặc định: sửa `seed` trong `src/theme/colors.json` rồi `npm run theme`. Màu khởi động PWA (`index.html`, manifest trong `vite.config.js`) được cập nhật tự động / theo bảng bên trên.

### 📱 Cài đặt như ứng dụng (PWA)

Sau khi build và deploy (hoặc chạy `npm run preview`), vào trang **Cài đặt** trong ứng dụng — nếu trình duyệt hỗ trợ, thẻ "Cài đặt ứng dụng" sẽ xuất hiện với nút cài đặt trực tiếp. Ứng dụng hoạt động cả khi ngoại tuyến nhờ Service Worker.

### 🎛️ Tuỳ chỉnh giao diện

Vào trang **Cài đặt** trong ứng dụng để:
- Chuyển chế độ Sáng / Tối / Theo hệ thống (có hiệu ứng lan tròn)
- Đổi ngôn ngữ Tiếng Việt / English
- Chọn màu chủ đạo: **Hồng Rose** (mặc định), Đơn sắc, Đỏ Son, Vàng Kim, Xanh Ngọc, Xanh Dương, Tím Huế, Hồng Đào, Cam Sen, Ngọc Lam (hoặc bật "Đổi màu ngẫu nhiên mỗi ngày")
- Chọn phông chữ: System / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro
- Chọn cỡ chữ: Nhỏ / Vừa / Lớn / Rất lớn

Các tuỳ chỉnh được lưu tự động vào `localStorage` của trình duyệt.

### 🌐 Landing page

`landing/index.html` là trang giới thiệu tĩnh (dùng 4 ảnh trong `screenshots/`). Mở trực tiếp bằng trình duyệt, hoặc deploy cả repo lên GitHub Pages / Netlify / Vercel (thư mục gốc) rồi truy cập `/landing/`.

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
- **Quick search**: open the command palette with `Ctrl/Cmd + K` to jump to any page.
- **Reminder notifications**: enable browser notifications for vegetarian days and chosen holidays, with a custom time and either same-day or N-days-in-advance reminders.
- **PWA**: a dedicated install card on the Settings page, installable to the home screen on mobile/desktop, and works offline via a Service Worker.

### 🎨 Material 3 Expressive (2026)

| Aspect | How it's applied |
|---|---|
| **Color** | A dynamic *vibrant* scheme generated from the primary color — default **Rose** (seed `#FF2056` → primary `#BE003A`). Full primary / secondary / tertiary / surface-container roles in 4 modes: light, dark, and both high-contrast. The "vegetarian" and "holiday" colors are *harmonized* to the primary. |
| **Shape** | Large corner radii (28–48px), borderless tonal cards; holiday icons and the selected day use **cookie / scallop / flower / sunny** shapes; buttons morph on press; connected button groups. |
| **Motion** | **Spring** tokens (spatial / spatial-fast / spatial-slow) generated as bouncy `linear()` easings; color & opacity use non-bouncy curves. Disabled automatically under *reduced motion*. |
| **Type** | Expressive type scale (bold headlines, tight tracking) + a typeface picker in Settings. |
| **Navigation** | Sidebar with a spring-sliding indicator, navigation rail, floating bottom bar on mobile. |

**Animation & effects**

- Changing month: day cells pop in as a **diagonal wave**; the selected day is a **cookie** shape that springs in and rotates.
- **Rolling numbers** (odometer) for countdowns and the lunar day; a flowing **wavy progress indicator**.
- Light/Dark switch: the new theme **expands as a circle** from the click point (View Transitions API); changing the primary color cross-fades every surface.
- **Morphing loading indicator**; ripple + state layers; pointer-following **spotlight** on cards; slowly rotating decorative shapes; scroll-driven reveal; springy toasts, sheets and dialogs.

### 🔤 Typefaces

Open **Settings → Typeface** to choose: **System** (default) · **Google Sans Flex** · **Roboto Flex** · **Roboto** · **Arial** · **Inter** · **Be Vietnam Pro**. All include full Vietnamese support. Web fonts are self-hosted via [Fontsource](https://fontsource.org) (no CDN dependency), loaded only when selected and cached for offline use.

### 🧱 Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + React Router (Hash) |
| Styling | TailwindCSS 3 + Material 3 Expressive tokens (color, shape, spring) |
| Theme generation | `@material/material-color-utilities` → `scripts/generate-theme.mjs` |
| Icons | Google Material Symbols (Outlined, subset-loaded) |
| Fonts | System / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro (Fontsource) |
| Build tool | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| i18n | In-app dictionary (vi/en), persisted to localStorage |
| Lunar algorithm | Hồ Ngọc Đức's astronomical algorithm |

### 📁 Project structure

```
calendar-pro/
├── public/                    # favicon.svg/.ico/.png, og-image.png, icons/ (any, maskable, monochrome, apple-touch)
├── screenshots/               # the 4 showcase images (README + landing)
├── landing/index.html         # static landing page
├── scripts/                   # generate-theme.mjs · generate-icons.py · screenshots.py
├── src/
│   ├── components/            # Layout, Sidebar, NavRail, BottomNav, RollingNumber, WavyProgress, Loader...
│   ├── contexts/              # SettingsContext (theme, color, typeface, language), ToastContext
│   ├── data/holidays.js       # Holiday & vegetarian-day data
│   ├── hooks/                 # useNow, useReminders, usePwaInstall
│   ├── i18n/                  # translations.js, useTranslation.js
│   ├── lib/                   # lunar.js, dateUtils.js, fonts.js, ripple.js, themeTransition.js
│   ├── pages/                 # HomePage, CalendarPage, VanNienPage, CountdownPage, SettingsPage
│   ├── theme/                 # colors.json (seeds) + generated material-theme.css / motion.css / shapes.css
│   └── App.jsx, main.jsx, index.css
└── index.html, tailwind.config.js, vite.config.js, package.json
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

### 🛠️ Helper scripts

```bash
npm run theme        # Regenerate colors / springs / shapes from src/theme/colors.json
npm run icons        # Regenerate favicon, app icons, og-image   (Python + Playwright + Pillow)
npm run build && npm run screenshots   # Re-shoot the 4 images in screenshots/ (Python + Playwright)
```

To change the default primary color, edit its `seed` in `src/theme/colors.json` and run `npm run theme`.

### 📱 Install as an app (PWA)

After building and deploying (or running `npm run preview`), open the **Settings** page in the app — if your browser supports it, an "Install app" card will appear with a one-tap install button. The app works offline thanks to its Service Worker.

### 🎛️ Customizing the look

Open the **Settings** page in the app to:
- Switch between Light / Dark / System mode (with the circular reveal)
- Switch language between Vietnamese / English
- Pick a primary color: **Rose** (default), Mono, Đỏ Son, Vàng Kim, Xanh Ngọc, Xanh Dương, Tím Huế, Hồng Đào, Cam Sen, Ngọc Lam (or enable "randomize color daily")
- Pick a typeface: System / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro
- Choose a font size: Small / Medium / Large / Extra large

All customizations are saved automatically to the browser's `localStorage`.

### 🌐 Landing page

`landing/index.html` is a static showcase page (it uses the 4 images in `screenshots/`). Open it directly, or deploy the whole repo (GitHub Pages / Netlify / Vercel) and visit `/landing/`.

### ⚠️ Data notes

- The solar/lunar conversion algorithm is based on the GMT+7 timezone and is highly accurate for modern years.
- The default vegetarian-day list follows **Nhị trai** (the 1st & 15th of the lunar month) — the most common convention; it may differ from the fasting calendar of a specific school of thought or individual practice.
- The holiday list is a compilation of common Vietnamese holidays and observances, provided for reference.

### 📄 License

Built for personal learning/reference purposes.

---

**Tác giả / Author:** minhtrong67

---

## Responsive

`<640px` floating bottom bar + drawer · `640–1023px` navigation rail · `≥1024px` full sidebar · `≥1280px` day detail beside the month grid.
