import { createContext, useContext, useMemo } from 'react'

const en = {
  brandSub: 'Shipgirl Roster', heroTag: 'Fleet database', heroDesc: 'Browse every shipgirl of the Azur Lane universe: filter by rarity, faction and hull type, inspect stats and export the roster.',
  pillShips: 'Ships', pillFactions: 'Factions', pillTypes: 'Ship types',
  search: 'Search by name, class or ID…', clearSearch: 'Clear search', filters: 'Filters',
  rarity: 'Rarity', nation: 'Faction', hull: 'Ship type', sort: 'Sort by',
  allFactions: 'All factions', allTypes: 'All ship types', resetFilters: 'Reset filters',
  sortRarityDesc: 'Rarity: high → low', sortRarityAsc: 'Rarity: low → high', sortNameAsc: 'Name: A → Z', sortNameDesc: 'Name: Z → A', sortStars: 'Stars: high → low',
  showing: 'Showing {n} of {m} ships', grid: 'Grid view', list: 'List view',
  settings: 'Settings', export: 'Export', copyName: 'Copy name', copiedOk: 'Copied “{name}”', copyFail: 'Could not copy to the clipboard',
  details: 'View details', close: 'Close', cancel: 'Cancel', done: 'Done', backTop: 'Back to top', loadMore: 'Load more',
  empty: 'No ships found', emptyHint: 'Try another keyword or clear some filters.',
  exportTitle: 'Export ship list', exportDesc: 'Choose which ships to include, then pick a file format.',
  scopeFiltered: 'Filtered ({n})', scopeAll: 'All ({n})', csv: 'Download CSV', json: 'Download JSON',
  exportOk: 'Exported {n} ships as {fmt}', exportEmpty: 'There are no ships to export with the current filters',
  appearance: 'Appearance', themeMode: 'Theme mode', light: 'Light', dark: 'Dark', system: 'System',
  accent: 'Theme color', fontSize: 'Font size', small: 'Small', medium: 'Medium', large: 'Large',
  language: 'Language', font: 'Font', data: 'Data', dataDesc: 'Ship data comes from the AzurAPI dataset and the Azur Lane Wiki.',
  resetSettings: 'Reset settings', resetTitle: 'Reset all settings?', resetDesc: 'Theme mode, color, font size, language and font will return to their defaults.',
  reset: 'Reset', settingsReset: 'Settings restored to defaults',
  author: 'Author', withAI: 'with the support of AI', 
  names: 'Names', info: 'Information', stats: 'Stats', wiki: 'Open wiki', class: 'Class', id: 'ID', build: 'Build time', artist: 'Artist', voice: 'Voice actor', stars: 'Stars',
  lv1: 'Lv.1', lv100: 'Lv.100', lv120: 'Lv.120',
  st_health: 'HP', st_armor: 'Armor', st_reload: 'Reload', st_luck: 'Luck', st_firepower: 'Firepower', st_torpedo: 'Torpedo', st_evasion: 'Evasion', st_speed: 'Speed', st_antiair: 'Anti-air', st_aviation: 'Aviation', st_oil: 'Oil cost', st_accuracy: 'Accuracy', st_asw: 'ASW'
}

const vi = {
  brandSub: 'Danh sách Shipgirl', heroTag: 'Cơ sở dữ liệu hạm đội', heroDesc: 'Duyệt toàn bộ shipgirl của vũ trụ Azur Lane: lọc theo độ hiếm, phe phái, loại tàu, xem chỉ số và xuất danh sách.',
  pillShips: 'Nhân vật', pillFactions: 'Phe phái', pillTypes: 'Loại tàu',
  search: 'Tìm theo tên, lớp tàu hoặc ID…', clearSearch: 'Xoá tìm kiếm', filters: 'Bộ lọc',
  rarity: 'Độ hiếm', nation: 'Phe phái', hull: 'Loại tàu', sort: 'Sắp xếp',
  allFactions: 'Tất cả phe phái', allTypes: 'Tất cả loại tàu', resetFilters: 'Đặt lại bộ lọc',
  sortRarityDesc: 'Độ hiếm: cao → thấp', sortRarityAsc: 'Độ hiếm: thấp → cao', sortNameAsc: 'Tên: A → Z', sortNameDesc: 'Tên: Z → A', sortStars: 'Số sao: cao → thấp',
  showing: 'Hiển thị {n} / {m} nhân vật', grid: 'Dạng lưới', list: 'Dạng danh sách',
  settings: 'Cài đặt', export: 'Xuất file', copyName: 'Sao chép tên', copiedOk: 'Đã sao chép “{name}”', copyFail: 'Không thể sao chép vào bộ nhớ tạm',
  details: 'Xem chi tiết', close: 'Đóng', cancel: 'Huỷ', done: 'Xong', backTop: 'Lên đầu trang', loadMore: 'Tải thêm',
  empty: 'Không tìm thấy nhân vật', emptyHint: 'Thử từ khoá khác hoặc bỏ bớt bộ lọc.',
  exportTitle: 'Xuất danh sách nhân vật', exportDesc: 'Chọn phạm vi nhân vật cần xuất, rồi chọn định dạng file.',
  scopeFiltered: 'Đang lọc ({n})', scopeAll: 'Tất cả ({n})', csv: 'Tải CSV', json: 'Tải JSON',
  exportOk: 'Đã xuất {n} nhân vật ra file {fmt}', exportEmpty: 'Không có nhân vật nào để xuất với bộ lọc hiện tại',
  appearance: 'Giao diện', themeMode: 'Chế độ giao diện', light: 'Sáng', dark: 'Tối', system: 'Hệ thống',
  accent: 'Màu chủ đề', fontSize: 'Cỡ chữ', small: 'Nhỏ', medium: 'Vừa', large: 'Lớn',
  language: 'Ngôn ngữ', font: 'Font chữ', data: 'Dữ liệu', dataDesc: 'Dữ liệu nhân vật lấy từ bộ dữ liệu AzurAPI và Azur Lane Wiki.',
  resetSettings: 'Đặt lại cài đặt', resetTitle: 'Đặt lại toàn bộ cài đặt?', resetDesc: 'Chế độ giao diện, màu chủ đề, cỡ chữ, ngôn ngữ và font chữ sẽ trở về mặc định.',
  reset: 'Đặt lại', settingsReset: 'Đã khôi phục cài đặt mặc định',
  author: 'Tác giả', withAI: 'với sự hỗ trợ của AI',
  names: 'Tên gọi', info: 'Thông tin', stats: 'Chỉ số', wiki: 'Mở wiki', class: 'Lớp tàu', id: 'ID', build: 'Thời gian chế tạo', artist: 'Hoạ sĩ', voice: 'Diễn viên lồng tiếng', stars: 'Số sao',
  lv1: 'Lv.1', lv100: 'Lv.100', lv120: 'Lv.120',
  st_health: 'HP', st_armor: 'Giáp', st_reload: 'Nạp đạn', st_luck: 'May mắn', st_firepower: 'Hoả lực', st_torpedo: 'Ngư lôi', st_evasion: 'Né tránh', st_speed: 'Tốc độ', st_antiair: 'Phòng không', st_aviation: 'Không quân', st_oil: 'Tiêu hao dầu', st_accuracy: 'Độ chính xác', st_asw: 'Chống ngầm'
}

const VAL = {
  hull: {
    Destroyer: 'Khu trục hạm', 'Light Cruiser': 'Tuần dương hạm nhẹ', 'Heavy Cruiser': 'Tuần dương hạm hạng nặng',
    Battleship: 'Thiết giáp hạm', 'Aircraft Carrier': 'Tàu sân bay', 'Light Carrier': 'Tàu sân bay hạng nhẹ',
    Submarine: 'Tàu ngầm', Battlecruiser: 'Tuần dương chiến liệt', 'Large Cruiser': 'Tuần dương hạm cỡ lớn',
    Monitor: 'Giám sát hạm', 'Munition Ship': 'Tàu đạn dược', Repair: 'Tàu sửa chữa',
    'Submarine Carrier': 'Tàu ngầm mang máy bay', 'Sailing Frigate': 'Khinh hạm buồm'
  },
  nat: {
    'Sakura Empire': 'Đế quốc Sakura', 'Eagle Union': 'Liên minh Đại Bàng', 'Royal Navy': 'Hải quân Hoàng gia',
    'Iron Blood': 'Huyết Sắt', 'Sardegna Empire': 'Đế quốc Sardegna', 'Northern Parliament': 'Nghị viện Phương Bắc',
    'Dragon Empery': 'Long Quốc', 'Vichya Dominion': 'Lãnh địa Vichya', Universal: 'Phổ thông'
  },
  rarity: {
    Normal: 'Thường', Rare: 'Hiếm', Elite: 'Tinh nhuệ', 'Super Rare': 'Siêu hiếm',
    'Ultra Rare': 'Cực hiếm', Priority: 'Ưu tiên', Decisive: 'Quyết chiến'
  }
}

const D = { en, vi }
const Ctx = createContext(null)

export function I18nProvider({ lang, children }) {
  const v = useMemo(() => ({
    lang,
    t: (k, p) => {
      let s = D[lang]?.[k] ?? en[k] ?? k
      if (p) for (const x in p) s = s.replace(`{${x}}`, p[x])
      return s
    },
    tv: (g, x) => (lang === 'vi' && VAL[g]?.[x]) || x
  }), [lang])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
