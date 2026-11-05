import { useAppearance, read } from './appearance'

// [tiếng Việt, English]
const D = {
  home: ['Tổng quan', 'Overview'], menu: ['Danh mục', 'Menu'], settings: ['Cài đặt', 'Settings'],
  collapse: ['Thu nhỏ thanh bên', 'Collapse sidebar'], expand: ['Mở rộng thanh bên', 'Expand sidebar'], top: ['Lên đầu trang', 'Back to top'],
  signin_text: ['Kho dữ liệu cá nhân. Đăng nhập bằng tài khoản Google để tiếp tục.', 'Your personal data vault. Sign in with Google to continue.'],
  signin_btn: ['Đăng nhập với Google', 'Sign in with Google'], checking: ['Đang kiểm tra đăng nhập…', 'Checking sign-in…'],
  denied_t: ['Không có quyền truy cập', 'Access denied'], denied_x: ['{email} không nằm trong danh sách được phép.', '{email} is not on the allowed list.'],
  signout: ['Đăng xuất', 'Sign out'], cfg_t: ['Thiếu cấu hình', 'Missing configuration'],
  cfg_x: ['Điền các biến VITE_FIREBASE_* vào file .env rồi chạy lại npm run dev.', 'Fill the VITE_FIREBASE_* variables in .env, then restart npm run dev.'],
  records_in: ['{n} bản ghi trong {m} bộ sưu tập', '{n} records in {m} collections'], loading: ['Đang tải dữ liệu…', 'Loading data…'],
  empty_t: ['Kho đang trống', 'The vault is empty'], empty_x: ['Nạp sẵn dữ liệu từ 8 file CSV vào Firestore chỉ với một lần bấm.', 'Load the data from the 8 CSV files into Firestore with one click.'],
  seed_btn: ['Nạp dữ liệu từ CSV', 'Load data from CSV'], share: ['Tỉ lệ dữ liệu', 'Data share'],
  search_ph: ['Tìm trong danh sách', 'Search this list'], view_grid: ['Dạng lưới', 'Grid view'], view_list: ['Dạng bảng dữ liệu', 'Table view'],
  newest: ['Mới nhất', 'Newest'], reverse: ['Đảo chiều sắp xếp', 'Reverse order'], filters: ['Bộ lọc', 'Filters'], filters_clear: ['Xoá bộ lọc', 'Clear filters'],
  all: ['Tất cả', 'All'], contains: ['Chứa…', 'Contains…'], add: ['Thêm mới', 'Add new'], edit: ['Sửa', 'Edit'], delete: ['Xoá', 'Delete'],
  cancel: ['Huỷ', 'Cancel'], save: ['Lưu', 'Save'], no_match: ['Không có kết quả khớp', 'No matches'], no_rec: ['Chưa có bản ghi nào', 'No records yet'],
  try_other: ['Thử từ khoá hoặc bộ lọc khác.', 'Try another keyword or filter.'], add_hint: ['Thêm mới, hoặc nhập CSV trong Cài đặt.', 'Add one, or import a CSV in Settings.'],
  count: ['{n} bản ghi', '{n} records'], count_match: ['{n} bản ghi khớp', '{n} matching records'],
  copy_hint: ['bấm vào tiêu đề hoặc giá trị để sao chép', 'click a title or value to copy'], click_copy: ['Bấm để sao chép', 'Click to copy'], copied: ['Đã sao chép', 'Copied'],
  more: ['Hiện thêm ({n})', 'Show more ({n})'], cats: ['Quản lý category', 'Manage categories'], del_t: ['Xoá bản ghi này?', 'Delete this record?'],
  del_x: ['Bản ghi sẽ bị xoá vĩnh viễn khỏi Firestore và không thể hoàn tác.', 'The record will be permanently removed from Firestore. This cannot be undone.'],
  add_x: ['Thêm {x}', 'Add {x}'], edit_x: ['Sửa {x}', 'Edit {x}'], pw_toggle: ['Hiện/ẩn mật khẩu', 'Show/hide password'],
  cat_in_use: ['Không thể xoá: {n} tag đang dùng category này.', 'Cannot delete: {n} tags still use this category.'],
  v_create_t: ['Tạo passphrase cho két', 'Create a vault passphrase'], v_unlock_t: ['Mở khoá két mật khẩu', 'Unlock the password vault'],
  v_create_x: ['Passphrase dùng để mã hoá mật khẩu trước khi lưu lên Firestore. Không thể khôi phục nếu quên, hãy ghi nhớ kỹ.', 'The passphrase encrypts passwords before they reach Firestore. It cannot be recovered if forgotten.'],
  v_unlock_x: ['Nhập passphrase để xem, sao chép hoặc lưu mật khẩu. Két sẽ khoá lại khi tải lại trang.', 'Enter the passphrase to view, copy or save passwords. The vault locks again on reload.'],
  v_pass: ['Passphrase', 'Passphrase'], v_pass2: ['Nhập lại passphrase', 'Repeat passphrase'], v_min: ['Passphrase tối thiểu 8 ký tự.', 'Passphrase needs at least 8 characters.'],
  v_mismatch: ['Hai passphrase không khớp.', 'The passphrases do not match.'], v_wrong: ['Passphrase không đúng.', 'Wrong passphrase.'],
  v_create_b: ['Tạo két', 'Create vault'], v_unlock_b: ['Mở khoá', 'Unlock'], v_need: ['Cần mở khoá két để lưu mật khẩu', 'Unlock the vault to save passwords'],
  v_fail: ['Không giải mã được mật khẩu này', 'Could not decrypt this password'], v_locked: ['Đã khoá két mật khẩu', 'Password vault locked'],
  v_need_seed: ['Cần tạo passphrase để mã hoá mật khẩu trước khi nạp.', 'Create a passphrase to encrypt passwords before loading.'],
  seeded: ['Đã nạp {n} bản ghi vào Firestore', 'Loaded {n} records into Firestore'], seed_none: ['Các bộ sưu tập đã có dữ liệu, không nạp thêm.', 'Collections already have data, nothing loaded.'],
  mig_none: ['Không có mật khẩu nào cần mã hoá.', 'No passwords need encrypting.'], mig_done: ['Đã mã hoá {n} mật khẩu', 'Encrypted {n} passwords'],
  import_done: ['Đã nhập {a}, cập nhật {u}, bỏ qua {s}', 'Imported {a}, updated {u}, skipped {s}'],
  csv_warn: ['File xuất chứa mật khẩu dạng văn bản thường, hãy giữ file cẩn thận.', 'The exported file contains plain-text passwords, keep it safe.'],
  offline: ['Bạn đang offline. Thay đổi sẽ đồng bộ khi có mạng trở lại.', 'You are offline. Changes will sync when you reconnect.'], error: ['Lỗi: ', 'Error: '],
  imp_t: ['Nhập vào {x}', 'Import into {x}'], imp_info: ['{n} dòng hợp lệ ({f} mới, {d} trùng)', '{n} valid rows ({f} new, {d} duplicates)'],
  imp_bad: ['{n} dòng thiếu trường bắt buộc sẽ bị bỏ qua.', '{n} rows missing required fields will be skipped.'], imp_cols: ['Cột cần có: {c}.', 'Expected columns: {c}.'],
  opt_skip: ['Bỏ qua dòng trùng', 'Skip duplicates'], opt_update: ['Cập nhật dòng trùng', 'Update duplicates'], opt_all: ['Nhập cả dòng trùng', 'Import duplicates too'],
  imp_pw: ['Mật khẩu sẽ được mã hoá bằng passphrase của két trước khi lưu.', 'Passwords are encrypted with the vault passphrase before saving.'],
  imp_btn: ['Nhập {n} dòng', 'Import {n} rows'], import_csv: ['Nhập CSV/JSON', 'Import CSV/JSON'], export_csv: ['Xuất CSV', 'Export CSV'], export_json: ['Xuất JSON', 'Export JSON'], open: ['Mở liên kết', 'Open link'], copy_url: ['Sao chép URL', 'Copy URL'],
  account: ['Tài khoản', 'Account'], appearance: ['Giao diện', 'Appearance'], mode: ['Chế độ hiển thị', 'Display mode'], light: ['Sáng', 'Light'], dark: ['Tối', 'Dark'], system: ['Theo hệ thống', 'System'],
  color: ['Màu chủ đề', 'Theme color'], fsize: ['Cỡ chữ', 'Text size'], small: ['Nhỏ', 'Small'], medium: ['Vừa', 'Medium'], large: ['Lớn', 'Large'],
  lang: ['Ngôn ngữ', 'Language'], font: ['Phông chữ', 'Font'], data: ['Dữ liệu', 'Data'], data_x: ['Nhập và xuất dữ liệu từng mục bằng file CSV hoặc JSON. Nhập dữ liệu tự động chống trùng.', 'Import and export each collection as CSV or JSON. Import detects duplicates automatically.'],
  enc_old: ['Mã hoá mật khẩu cũ', 'Encrypt old passwords'], lock_now: ['Khoá két ngay', 'Lock vault now'], about: ['Về ứng dụng', 'About'],
  made: ['Thiết kế và xây dựng bởi', 'Designed and built by'], ai: ['Với sự hỗ trợ của AI', 'With help from the AI'],
  'f:Ghi chú': ['Ghi chú', 'Note'], 'f:Trạng thái': ['Trạng thái', 'Status'], 'f:Tên': ['Tên', 'Name'],
}

export const tr = (k, v) => {
  let s = (D[k] || [k, k])[read().lang === 'en' ? 1 : 0]
  for (const x in v) s = s.replace(`{${x}}`, v[x])
  return s
}
export const fl = (label) => tr('f:' + label).replace(/^f:/, '')
export function useT() { useAppearance(); return tr }
