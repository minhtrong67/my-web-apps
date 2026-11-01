export const LANGS = { vi: 'Tiếng Việt', en: 'English' }

const vi = {
  'search.placeholder': 'Tìm tên, họ tên, seiyuu…  VD: school:abydos age>16',
  'search.clear': 'Xóa tìm kiếm',
  count: 'Hiển thị {n} / {total} học sinh',
  'filter.title': 'Bộ lọc', 'filter.clear': 'Xóa lọc', 'filter.clearAll': 'Xóa tất cả', 'filter.apply': 'Xem {n} học sinh', 'filter.none': 'Không có kết quả', 'filter.open': 'Mở bộ lọc',
  'sort.label': 'Sắp xếp', 'dir.asc': 'Tăng dần', 'dir.desc': 'Giảm dần', 'dir.toggle': 'Đổi chiều sắp xếp',
  'sort.name': 'Tên', 'sort.rel': 'Liên quan nhất', 'sort.rarity': 'Độ hiếm', 'sort.rjp': 'Ngày ra mắt (JP)', 'sort.rgl': 'Ngày ra mắt (Global)',
  'sort.school': 'Trường', 'sort.age': 'Tuổi', 'sort.height': 'Chiều cao', 'sort.bd': 'Sinh nhật', 'sort.urban': 'Địa hình Đô thị', 'sort.outdoor': 'Địa hình Ngoài trời', 'sort.indoor': 'Địa hình Trong nhà',
  'view.grid': 'Lưới', 'view.list': 'Danh sách',
  'fav.only': 'Đã lưu', 'fav.add': 'Thêm vào yêu thích', 'fav.remove': 'Bỏ yêu thích', 'fav.added': 'Đã thêm vào yêu thích', 'fav.removed': 'Đã bỏ khỏi yêu thích',
  'fav.emptyTitle': 'Chưa có học sinh yêu thích', 'fav.emptyHint': 'Bấm biểu tượng trái tim trên thẻ học sinh để lưu lại.',
  'copy.btn': 'Sao chép', 'copy.done': 'Đã chép', 'copy.title': 'Sao chép họ tên', 'copy.ok': 'Đã sao chép', 'copy.fail': 'Không sao chép được', 'copy.failSub': 'Trình duyệt đang chặn quyền clipboard.',
  'empty.title': 'Không tìm thấy học sinh phù hợp', 'empty.hint': 'Thử bỏ bớt bộ lọc hoặc đổi từ khóa.', 'empty.suggest': 'Có phải ý bạn là',
  'g.school': 'Trường', 'g.role': 'Vai trò', 'g.cls': 'Loại (Striker/Special)', 'g.pos': 'Vị trí', 'g.atk': 'Loại tấn công', 'g.armor': 'Loại giáp', 'g.arm': 'Loại giáp',
  'g.weapon': 'Vũ khí', 'g.rarity': 'Độ hiếm', 'g.pool': 'Nhóm tuyển', 'g.variant': 'Biến thể / Trang phục', 'g.cover': 'Dùng cover',
  'g.urban': 'Địa hình: Đô thị', 'g.outdoor': 'Địa hình: Ngoài trời', 'g.indoor': 'Địa hình: Trong nhà', 'g.month': 'Tháng sinh',
  original: 'Gốc', yes: 'Có', no: 'Không', month: 'Tháng {n}', close: 'Đóng', prev: 'Trước', next: 'Sau', wiki: 'Wiki', 'of': '{a} / {b}',
  'd.combat': 'Chiến đấu', 'd.personal': 'Cá nhân', 'd.terrain': 'Thích nghi địa hình', 'd.release': 'Ra mắt & Sáng tạo', 'd.variants': 'Phiên bản khác của {name}',
  'l.school': 'Trường', 'l.cls': 'Loại', 'l.role': 'Vai trò', 'l.pos': 'Vị trí', 'l.weapon': 'Vũ khí', 'l.cover': 'Cover', 'l.pool': 'Nhóm tuyển', 'l.variant': 'Biến thể',
  'l.age': 'Tuổi', 'l.bd': 'Sinh nhật', 'l.height': 'Chiều cao', 'l.hobbies': 'Sở thích', 'l.urban': 'Đô thị', 'l.outdoor': 'Ngoài trời', 'l.indoor': 'Trong nhà',
  'l.rjp': 'Ra mắt (JP)', 'l.rgl': 'Ra mắt (Global)', 'l.notReleased': 'Chưa ra mắt', 'l.cv': 'Seiyuu', 'l.designer': 'Thiết kế', 'l.illustrator': 'Họa sĩ', 'l.lobby': 'Họa sĩ lobby',
  'l.name': 'Tên', 'l.rarity': 'Độ hiếm', 'l.atk': 'Tấn công', 'l.arm': 'Giáp',
  'set.title': 'Cài đặt', 'set.sub': 'Giao diện & dữ liệu', 'set.open': 'Mở cài đặt',
  'set.theme': 'Chế độ hiển thị', 'theme.light': 'Sáng', 'theme.dark': 'Tối', 'theme.system': 'Hệ thống',
  'set.color': 'Màu chủ đạo', 'set.customColor': 'Chọn màu tùy ý', 'set.lang': 'Ngôn ngữ',
  'set.font': 'Font chữ', 'font.sans': 'Mặc định', 'font.round': 'Bo tròn', 'font.serif': 'Serif', 'font.mono': 'Monospace',
  'set.size': 'Cỡ chữ', 'set.motion': 'Hiệu ứng chuyển động', 'set.motionHint': 'Tắt để giảm hiệu ứng khi cuộn và mở hộp thoại',
  'set.data': 'Dữ liệu', 'set.exportAll': 'Xuất tất cả ({n})', 'set.exportCur': 'Đang lọc ({n})', 'set.favs': '{n} học sinh yêu thích',
  'set.install': 'Cài đặt ứng dụng', 'set.reset': 'Khôi phục mặc định', 'set.done': 'Xong',
  'set.about': 'Tác giả', 'set.aboutBy': 'Phát triển bởi {author}', 'set.aboutAi': 'với sự hỗ trợ của {ai}',
  'toast.exported': 'Đã xuất dữ liệu', 'toast.imported': 'Đã nhập yêu thích', 'toast.importSub': 'Thêm {n} học sinh vào danh sách yêu thích',
  'toast.importFail': 'Tệp không hợp lệ', 'toast.importFailSub': 'Hãy chọn tệp JSON đã xuất từ BA List.', 'toast.reset': 'Đã khôi phục cài đặt mặc định',
  'toast.installed': 'Đã cài đặt ứng dụng', 'toast.offline': 'Bạn đang ngoại tuyến', 'toast.offlineSub': 'Một số ảnh có thể chưa tải được.', 'toast.online': 'Đã kết nối lại',
  'scroll.top': 'Lên đầu trang', 'app.tagline': 'Danh sách học sinh Blue Archive',
}
vi['set.import'] = 'Nhập yêu thích'
vi['set.anim'] = 'Hoạt ảnh'
vi['set.exportFavs'] = 'Xuất yêu thích ({n})'

const en = {
  'search.placeholder': 'Search name, voice actor…  e.g. school:abydos age>16',
  'search.clear': 'Clear search',
  count: 'Showing {n} of {total} students',
  'filter.title': 'Filters', 'filter.clear': 'Clear', 'filter.clearAll': 'Clear all', 'filter.apply': 'Show {n} students', 'filter.none': 'No results', 'filter.open': 'Open filters',
  'sort.label': 'Sort by', 'dir.asc': 'Ascending', 'dir.desc': 'Descending', 'dir.toggle': 'Toggle sort direction',
  'sort.name': 'Name', 'sort.rel': 'Most relevant', 'sort.rarity': 'Rarity', 'sort.rjp': 'Release date (JP)', 'sort.rgl': 'Release date (Global)',
  'sort.school': 'School', 'sort.age': 'Age', 'sort.height': 'Height', 'sort.bd': 'Birthday', 'sort.urban': 'Urban terrain', 'sort.outdoor': 'Outdoor terrain', 'sort.indoor': 'Indoor terrain',
  'view.grid': 'Grid', 'view.list': 'List',
  'fav.only': 'Saved', 'fav.add': 'Add to favorites', 'fav.remove': 'Remove from favorites', 'fav.added': 'Added to favorites', 'fav.removed': 'Removed from favorites',
  'fav.emptyTitle': 'No favorite students yet', 'fav.emptyHint': 'Tap the heart on a student card to save them.',
  'copy.btn': 'Copy', 'copy.done': 'Copied', 'copy.title': 'Copy full name', 'copy.ok': 'Copied', 'copy.fail': 'Could not copy', 'copy.failSub': 'The browser blocked clipboard access.',
  'empty.title': 'No matching students found', 'empty.hint': 'Try removing some filters or changing the keywords.', 'empty.suggest': 'Did you mean',
  'g.school': 'School', 'g.role': 'Role', 'g.cls': 'Type (Striker/Special)', 'g.pos': 'Position', 'g.atk': 'Attack type', 'g.arm': 'Armor type',
  'g.weapon': 'Weapon', 'g.rarity': 'Rarity', 'g.pool': 'Recruit pool', 'g.variant': 'Variant / Outfit', 'g.cover': 'Uses cover',
  'g.urban': 'Terrain: Urban', 'g.outdoor': 'Terrain: Outdoor', 'g.indoor': 'Terrain: Indoor', 'g.month': 'Birth month',
  original: 'Original', yes: 'Yes', no: 'No', month: 'Month {n}', close: 'Close', prev: 'Previous', next: 'Next', wiki: 'Wiki', 'of': '{a} / {b}',
  'd.combat': 'Combat', 'd.personal': 'Personal', 'd.terrain': 'Terrain adaptation', 'd.release': 'Release & Credits', 'd.variants': 'Other versions of {name}',
  'l.school': 'School', 'l.cls': 'Type', 'l.role': 'Role', 'l.pos': 'Position', 'l.weapon': 'Weapon', 'l.cover': 'Cover', 'l.pool': 'Recruit pool', 'l.variant': 'Variant',
  'l.age': 'Age', 'l.bd': 'Birthday', 'l.height': 'Height', 'l.hobbies': 'Hobbies', 'l.urban': 'Urban', 'l.outdoor': 'Outdoor', 'l.indoor': 'Indoor',
  'l.rjp': 'Release (JP)', 'l.rgl': 'Release (Global)', 'l.notReleased': 'Not released', 'l.cv': 'Voice actor', 'l.designer': 'Designer', 'l.illustrator': 'Illustrator', 'l.lobby': 'Lobby illustrator',
  'l.name': 'Name', 'l.rarity': 'Rarity', 'l.atk': 'Attack', 'l.arm': 'Armor',
  'set.title': 'Settings', 'set.sub': 'Appearance & data', 'set.open': 'Open settings',
  'set.theme': 'Appearance', 'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.system': 'System',
  'set.color': 'Accent color', 'set.customColor': 'Pick a custom color', 'set.lang': 'Language',
  'set.font': 'Typeface', 'font.sans': 'Default', 'font.round': 'Rounded', 'font.serif': 'Serif', 'font.mono': 'Monospace',
  'set.size': 'Text size', 'set.motion': 'Motion effects', 'set.motionHint': 'Turn off to reduce animations when scrolling and opening sheets',
  'set.data': 'Data', 'set.exportAll': 'Export all ({n})', 'set.exportCur': 'Current filter ({n})', 'set.import': 'Import favorites', 'set.anim': 'Animation', 'set.exportFavs': 'Export favorites ({n})', 'set.favs': '{n} favorite students',
  'set.install': 'Install app', 'set.reset': 'Reset to defaults', 'set.done': 'Done',
  'set.about': 'Author', 'set.aboutBy': 'Developed by {author}', 'set.aboutAi': 'with AI assistance from {ai}',
  'toast.exported': 'Data exported', 'toast.imported': 'Favorites imported', 'toast.importSub': 'Added {n} students to your favorites',
  'toast.importFail': 'Invalid file', 'toast.importFailSub': 'Choose a JSON file exported from BA List.', 'toast.reset': 'Settings restored to defaults',
  'toast.installed': 'App installed', 'toast.offline': 'You are offline', 'toast.offlineSub': 'Some images may not load.', 'toast.online': 'Back online',
  'scroll.top': 'Back to top', 'app.tagline': 'Blue Archive student list',
}

const D = { vi, en }
export const makeT = (lang) => (k, p) => {
  let s = D[lang]?.[k] ?? D.vi[k] ?? k
  if (p) for (const x in p) s = s.replaceAll(`{${x}}`, p[x])
  return s
}
export const detectLang = () => ((navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en')
