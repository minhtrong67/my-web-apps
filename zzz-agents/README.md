<div align="center">

# ZZZ Agents

**Cơ sở dữ liệu agent Zenless Zone Zero — giao diện lấy cảm hứng từ chính game.**

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8)

</div>

> Fan-made project, không liên kết với HoYoverse. Mọi hình ảnh và dữ liệu game thuộc về chủ sở hữu tương ứng.

## Tính năng

- **Danh sách agent đầy đủ** tải trực tiếp từ API, kèm ảnh, tự cập nhật khi có agent mới.
- **Card** hiển thị dạng **Grid** hoặc **List**; nút sao chép tên; bấm vào card để xem **chi tiết** (thông tin, hồ sơ, chỉ số, kỹ năng).
- **Bộ lọc & tìm kiếm** theo độ hiếm, thuộc tính, chuyên môn, loại tấn công; tìm theo tên EN/JA/ZH/KO; sắp xếp.
- **Cài đặt**: giao diện Sáng / Tối / Hệ thống, 19 màu chủ đề, cỡ chữ, ngôn ngữ (EN/VI), font chữ (custom dropdown), xuất dữ liệu (JSON / CSV, toàn bộ hoặc theo bộ lọc), làm mới dữ liệu, đặt lại cài đặt.
- **Phím tắt**: `Ctrl/⌘ K` hoặc `/` tìm kiếm · `G` lưới/danh sách · `F` bộ lọc · `S` cài đặt · `T` lên đầu trang · `←` `→` đổi agent.
- **Lightbox ảnh** và nút Trước/Sau trong dialog chi tiết (hỗ trợ vuốt trên điện thoại).
- **UI/UX**: toast 4 variant (info / success / error / warning), tooltip tùy chỉnh, dialog có nút kèm icon + label + màu, scrollbar tùy chỉnh, nút cuộn lên đầu trang, animation mượt (tôn trọng `prefers-reduced-motion`).
- **PWA**: cài đặt được, chạy offline với dữ liệu và ảnh đã cache.

### Mới trong bản này

- **Yêu thích** (lưu local) + bộ lọc "chỉ yêu thích"; **so sánh 2 agent** (chỉ số, thuộc tính, phe phái).
- **Bộ lọc phe phái**: tải một lần từ trang chi tiết (có nút trong bảng lọc), lưu lại để dùng offline.
- **Trạng thái nằm trong URL** (`#q=…&e=Fire&agent=1391`): chia sẻ link, nút Back của trình duyệt đóng đúng lớp đang mở (chi tiết, cài đặt, so sánh).
- **Skeleton loading** cho trang, card, ảnh và chi tiết; shimmer dùng `transform` nên không gây giật.
- **Accessibility**: focus trap + Esc cho drawer/dialog/lightbox, trả focus khi đóng, khóa cuộn nền, focus ring rõ ràng, tự chỉnh màu chữ nhấn đạt tương phản ≥ 4.5.
- **PWA**: banner "có phiên bản mới" (cập nhật khi người dùng đồng ý) và nút cài đặt ứng dụng trong Cài đặt.
- **Ngôn ngữ phần chi tiết** chọn được (EN/JA/ZH/KO) vì nguồn dữ liệu chưa có tiếng Việt.
- Kỹ năng hiển thị đầy đủ mô tả (bấm để mở rộng); lightbox có thể đổi giữa ảnh chân dung và ảnh nghệ thuật.

## Công nghệ

React 18 · Vite 5 · Tailwind CSS 3 · vite-plugin-pwa

## Bắt đầu

```bash
npm install
npm run dev       # chạy môi trường phát triển
npm run build     # build production (có service worker)
npm run preview   # xem thử bản build
```

## Nguồn dữ liệu

| Dữ liệu | Nguồn |
| --- | --- |
| Danh sách, chi tiết, ảnh agent | [Nanoka](https://nanoka.cc) (`static.nanoka.cc`), tiền thân Hakush.in |
| Danh sách dự phòng (offline lần đầu) | `src/data.js` → `SNAPSHOT` (tham khảo Akademiya) |

Luồng tải: `manifest.json` → phiên bản mới nhất → `zzz/<version>/character.json` (danh sách) và `zzz/<version>/en/character/<id>.json` (chi tiết). Kết quả được lưu `localStorage` và cache bằng service worker. Nếu API đổi cấu trúc, chỉnh trong `fetchAgents()` / `fetchDetail()` ở `src/data.js`.

## Cấu trúc

```
src/
├─ App.jsx            # trang chính: filter, grid/list, scroll-to-top
├─ data.js            # API, ánh xạ dữ liệu, snapshot dự phòng
├─ i18n.js            # chuỗi EN / VI
├─ settings.jsx       # context cài đặt (theme, màu, font, cỡ chữ…)
├─ icons.jsx
├─ useLayer.js        # focus trap / Esc / khóa cuộn cho các lớp phủ
├─ exporter.js        # xuất JSON / CSV
└─ components/        # AgentCard, AgentDialog, CompareDialog, Lightbox, Settings, Select, Modal, Toast, Tooltip, Btn, Skeleton
```

## Tùy biến

- **Thêm màu chủ đề / font**: sửa `COLORS` và `FONTS` trong `src/settings.jsx`.
- **Thêm ngôn ngữ**: thêm bảng chuỗi mới trong `src/i18n.js`.

## Tác giả

**minhtrong67** — với sự hỗ trợ của AI **Claude** (Anthropic).
