# Sayuri Vault
React 19 + Vite + Tailwind CSS v4 + Firebase (Firestore), giao diện Material 3 Expressive.

```bash
npm install
cp .env.example .env     # điền cấu hình Firebase web app
npm run dev
```

1. Firebase Console → tạo Firestore → dán `firestore.rules` vào tab Rules (hoặc `firebase deploy --only firestore:rules`).
2. Mở app → Tổng quan → **Nạp dữ liệu từ CSV** để đẩy 274 bản ghi (`src/seed.json`) vào 8 collection (chỉ nạp collection còn trống).
3. Thêm mục mới: thêm 1 object vào `src/config/modules.js` + 1 dòng trong `STYLE` (cùng file).

Xuất CSV/Excel/PDF, nhập CSV dùng đúng tên cột của file CSV gốc.
## Đăng nhập Google
- Firebase Console → Authentication → Sign-in method → bật **Google**. Khi deploy, thêm domain vào Authorized domains.
- Sửa `REPLACE_WITH_YOUR_EMAIL@gmail.com` trong `firestore.rules` thành email của bạn rồi deploy rules (đây là lớp bảo vệ thật sự).
- Tuỳ chọn: điền `VITE_ALLOWED_EMAIL` trong `.env` để app chặn sớm các tài khoản khác.
