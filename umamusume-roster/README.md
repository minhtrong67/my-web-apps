<div align="center">

# 🏇 Umamusume Roster

**A fast, installable character index for _Umamusume: Pretty Derby_ — grid or list, searchable, filterable and fully themeable.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)

[English](#english) · [Tiếng Việt](#tiếng-việt)

</div>

---

## English

### Overview

Umamusume Roster indexes **294 characters** — playable Umamusume, supporting cast, anime-exclusive characters, and the _Cinderella Gray_ and _Star Blossom_ casts — in a racetrack-inspired interface. It runs entirely in the browser (no backend) and works offline once installed.

### Features

- **Grid & list views** with card layout, remembered between visits.
- **Search** (accent-insensitive, press `/` to focus) and **filters**: group, name prefix, first letter, favorites, plus sorting (default, A → Z, Z → A).
- **Character details** dialog with previous / next navigation (← → keys), profile (Japanese name, voice actor, birthday with countdown and zodiac, height, three sizes, shoe size, division, dorm) and links to the wiki, GameTora and Fandom.
- **Export** the whole roster, the current results or your favorites as **JSON** or **CSV** (UTF-8 with BOM for Excel), with a live preview.
- **Shareable URLs**: filters, sorting and the open character are stored in the address bar.
- **Smooth browsing**: incremental loading, search highlighting, random pick, one-tap copy feedback, and an option to turn animations off.
- **Copy name** button on every card, placed outside the artwork.
- **Favorites** stored on-device.
- **Settings** sheet:
  - Theme: light / dark / follow system
  - 19 theme colors (Red → Blue Grey) in a balanced swatch grid
  - Font size: small / medium / large
  - Language: English / Tiếng Việt
  - Font: System (default) / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro — selected through a custom dropdown
- **UI details**: custom tooltips, scrollbars, dropdowns, dialogs, confirm dialogs and sheet; action buttons carry label, icon and color; four toast variants (info, success, warning, error) used sparingly; smooth scroll-to-top; keyboard-accessible overlays; `prefers-reduced-motion` respected.
- **PWA**: installable, precached app shell, runtime caching for icons and fonts, in-app update prompt.

### Tech stack

React 18 · Tailwind CSS 4 · Vite 6 · vite-plugin-pwa · lucide-react

### Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build in ./dist
npm run preview    # preview the production build
```

Requires Node.js 18 or newer.

### Project structure

```
src/
├─ components/      Select, Tooltip, Toast, Overlay (Modal / Sheet / Confirm), cards, settings…
├─ data/characters.js   Character index, groups, icon/wiki URL helpers
├─ lib/settings.jsx     Theme, color, size, font and language state (persisted)
├─ i18n.js              English and Vietnamese strings
├─ index.css            Design tokens, animations, scrollbar
├─ App.jsx · main.jsx
```

### Data

The index currently lists names, groups and icons. Names and icon file names come from [umamusu.wiki](https://umamusu.wiki/List_of_Characters); cross-check with [umamusume.com](https://umamusume.com/characters/), [Fandom](https://umamusume.fandom.com/wiki/Characters) and [GameTora](https://gametora.com/umamusume/characters).

- **Add or fix a character**: edit the lists in `src/data/characters.js`. Use `Name=IconFile.png` when the wiki icon file name differs from `Name_(Icon).png`.
- **Icons** are loaded from umamusu.wiki. If an icon fails to load, an initials avatar is shown. To self-host icons, change `iconUrl()` in `src/data/characters.js`.
- **Profiles** are bundled for 44 characters (`PROFILES` in `src/data/characters.js`) from [dbltap](https://www.dbltap.com/guides/umamusume-characters-all-current-upcoming), GameTora and umamusu.wiki. Characters without a verified source show a notice and link out instead of guessed values. To add one, append a line: `Name|MM-DD|height|bust-waist-hip|Japanese name|voice actor|division|dorm|shoe size`.

### Credits & disclaimer

Built by **minhtrong67** with AI assistance from **Claude**. This is an unofficial fan project; _Umamusume: Pretty Derby_ and all related names and artwork are © Cygames, Inc. Character data credit goes to the community wikis listed above.

---

## Tiếng Việt

### Giới thiệu

Umamusume Roster tổng hợp **294 nhân vật** của _Umamusume: Pretty Derby_ (Uma Musume, nhân vật phụ, nhân vật riêng của anime, dàn _Cinderella Gray_ và _Star Blossom_) với giao diện lấy cảm hứng từ đường đua. Ứng dụng chạy hoàn toàn trên trình duyệt, không cần backend và dùng được offline sau khi cài.

### Tính năng

- Xem dạng **lưới** hoặc **danh sách**, ghi nhớ lựa chọn.
- **Tìm kiếm** (không phân biệt dấu, nhấn `/` để focus) và **bộ lọc**: nhóm, tiền tố tên, chữ cái đầu, yêu thích; sắp xếp mặc định, A → Z, Z → A.
- **Chi tiết nhân vật** trong dialog, chuyển nhân vật trước/sau bằng phím ← →, liên kết wiki và Fandom.
- Nút **sao chép tên** trên mỗi thẻ, nằm ngoài vùng ảnh.
- **Hồ sơ nhân vật** (tên Nhật, CV, sinh nhật kèm đếm ngược và cung hoàng đạo, chiều cao, ba vòng, cỡ giày, khối lớp, ký túc xá) và liên kết wiki/GameTora/Fandom.
- **Xuất danh sách** toàn bộ, kết quả đang lọc hoặc yêu thích ra **JSON** / **CSV**, có xem trước.
- Bộ lọc, sắp xếp và nhân vật đang mở được lưu trên URL để chia sẻ; tải dần danh sách, tô sáng từ khoá, chọn ngẫu nhiên, tuỳ chọn tắt hiệu ứng.
- **Yêu thích** lưu trên thiết bị.
- **Cài đặt**: giao diện sáng / tối / hệ thống; 19 màu chủ đề; cỡ chữ nhỏ / vừa / lớn; ngôn ngữ English / Tiếng Việt; font chữ (mặc định là font hệ thống) chọn bằng dropdown tuỳ chỉnh.
- Tooltip, scrollbar, dropdown, dialog, confirm dialog, sheet đều được tuỳ chỉnh; nút hành động có đủ nhãn, icon và màu nền; toast 4 loại dùng tiết kiệm; nút lên đầu trang cuộn mượt.
- **PWA**: cài được như ứng dụng, cache offline, nhắc cập nhật phiên bản mới.

### Chạy dự án

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Dữ liệu

Tên và icon nhân vật lấy từ [umamusu.wiki](https://umamusu.wiki/List_of_Characters). Để thêm hoặc sửa nhân vật, chỉnh danh sách trong `src/data/characters.js` (dùng cú pháp `Tên=TênFileIcon.png` khi tên file icon trên wiki không theo mẫu chuẩn). Nếu icon không tải được, ứng dụng hiển thị avatar chữ cái đầu. Hồ sơ chi tiết hiện có cho 44 nhân vật (biến `PROFILES` trong `src/data/characters.js`); nhân vật chưa có nguồn xác minh sẽ hiện thông báo thay vì dữ liệu đoán. Thêm nhân vật bằng một dòng: `Tên|MM-DD|chiều cao|ngực-eo-hông|tên Nhật|CV|khối|ký túc xá|cỡ giày`.

### Tác giả

Thực hiện bởi **minhtrong67** với sự hỗ trợ của AI **Claude**. Đây là dự án fan không chính thức; _Umamusume: Pretty Derby_ cùng toàn bộ tên và hình ảnh thuộc bản quyền © Cygames, Inc.
