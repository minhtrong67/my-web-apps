# 🔷 BA List

**BA List** là web tra cứu danh sách học sinh **Blue Archive**: tìm kiếm thông minh, bộ lọc nhiều tiêu chí, xem chi tiết từng học sinh, lưu yêu thích và dùng được offline (PWA).

Xây dựng bằng **React 19 + Vite + Tailwind CSS 4**, giao diện theo phong cách **Blue Archive** (hình bình hành vát chéo, sọc chéo, tiêu đề in nghiêng, xanh dương chủ đạo + vàng nhấn; toàn bộ bảng màu sáng/tối dẫn xuất từ một màu chủ đạo) với icon **Lucide**.

## Ảnh chụp màn hình

| Desktop – sáng | Desktop – tối, chi tiết (side sheet) |
| :---: | :---: |
| ![Desktop](screenshots/image01.png) | ![Chi tiết](screenshots/image02.png) |

| Mobile | Mobile – bộ lọc (bottom sheet) |
| :---: | :---: |
| <img src="screenshots/image03.png" width="300"> | <img src="screenshots/image04.png" width="300"> |

> Ảnh chụp dùng ảnh minh họa thay cho ảnh học sinh thật. Hãy chụp lại từ bản chạy thật nếu muốn.

## Tính năng

- **Tìm kiếm thông minh**: bỏ dấu tiếng Việt, chịu lỗi gõ sai, xếp hạng theo độ liên quan, gợi ý "Có phải ý bạn là…". Hỗ trợ cú pháp nâng cao.
- **Bộ lọc**: 15 nhóm (trường, vai trò, vị trí, loại tấn công, loại giáp, vũ khí, độ hiếm, địa hình, tháng sinh…), chọn nhiều giá trị, hiển thị chip đang áp dụng.
- **Sắp xếp** theo 12 tiêu chí, đổi chiều, chế độ **lưới / danh sách**.
- **Chi tiết học sinh** dạng sheet (bottom sheet trên mobile, side sheet trên desktop): chuyển trước/sau bằng nút hoặc phím ←/→, các phiên bản khác của cùng nhân vật, link Wiki, deep link `#Tên`.
- **Yêu thích** (lưu trên trình duyệt), lọc "Đã lưu", xuất/nhập danh sách yêu thích.
- **Sao chép họ tên** một chạm, kèm **toast** 4 loại (thành công / thông tin / cảnh báo / lỗi).
- **Cài đặt**: chế độ sáng/tối/hệ thống, màu chủ đạo (6 màu + chọn tùy ý), ngôn ngữ **Tiếng Việt / English**, font chữ, cỡ chữ, tắt hiệu ứng, xuất JSON, cài đặt PWA.
- **Offline** nhờ service worker, ảnh wiki được cache.
- Responsive, dark mode, nút cuộn lên đầu trang, thanh cuộn tùy chỉnh, kéo thanh nắm để đóng sheet trên mobile. Ảnh trên thẻ luôn sạch (không có huy hiệu hay nút nào đè lên), render dần danh sách để mở sheet mượt.

### Cú pháp tìm kiếm nâng cao

| Ví dụ | Ý nghĩa |
| --- | --- |
| `school:abydos` | lọc theo trường |
| `role:healer weapon:smg` | kết hợp nhiều điều kiện |
| `age>16` · `height<=155` | so sánh số (`>`, `<`, `>=`, `<=`, `=`) |
| `cv:ayumi` · `artist:mx2j` | theo seiyuu / họa sĩ |
| `akane school:millennium` | từ khóa + điều kiện |

Nhấn `/` để focus ô tìm kiếm, `Esc` để xóa.

## Chạy dự án

Yêu cầu Node.js 20+.

```bash
npm install
npm run dev       # chạy dev server
npm run build     # build ra thư mục dist/
npm run preview   # xem thử bản build
```

## Triển khai lên GitHub Pages

Repo đã có sẵn workflow `.github/workflows/pages.yml`. Vào **Settings → Pages → Source: GitHub Actions**, sau đó mỗi lần push lên nhánh `main` web sẽ tự build và deploy. Vite dùng `base: './'` nên chạy được ở mọi đường dẫn.

## Cấu trúc

```
ba-list/
├── index.html
├── vite.config.js
├── public/               # favicon, icon PWA, manifest, sw.js, og-image…
├── screenshots/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css         # Tailwind + biến màu Blue Archive + hình khối + animation
    ├── data/students.js  # dữ liệu 278 học sinh
    ├── lib/
    │   ├── search.js     # tìm kiếm, lọc, sắp xếp
    │   ├── theme.js      # áp màu chủ đạo (bảng màu dẫn xuất bằng color-mix trong index.css)
    │   ├── i18n.js       # Tiếng Việt / English
    │   ├── students.js   # chuẩn hóa dữ liệu
    │   └── app-context.jsx  # cài đặt, toast, yêu thích
    └── components/       # Sheet, DetailSheet, SettingsSheet, FilterPanel, …
```

## Dữ liệu & bản quyền

Dữ liệu học sinh lấy từ [bluearchive.wiki](https://bluearchive.wiki). Blue Archive và hình ảnh nhân vật thuộc về NEXON Games / Yostar. Dự án phi thương mại, chỉ phục vụ tra cứu.

## Giấy phép

[MIT](LICENSE)
