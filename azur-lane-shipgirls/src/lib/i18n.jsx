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
  prev: 'Previous ship', next: 'Next ship',
  shortcuts: 'Keyboard shortcuts', scSearch: 'Focus search', scClear: 'Clear / leave search', scView: 'Toggle grid / list', scExport: 'Open export', scSettings: 'Open settings', scTheme: 'Cycle theme mode', scNav: 'Previous / next ship in details', scHelp: 'Show this help',
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
  prev: 'Nhân vật trước', next: 'Nhân vật sau',
  shortcuts: 'Phím tắt', scSearch: 'Mở ô tìm kiếm', scClear: 'Xoá / thoát tìm kiếm', scView: 'Đổi dạng lưới / danh sách', scExport: 'Mở xuất file', scSettings: 'Mở cài đặt', scTheme: 'Đổi chế độ giao diện', scNav: 'Nhân vật trước / sau trong chi tiết', scHelp: 'Hiện bảng phím tắt',
  lv1: 'Lv.1', lv100: 'Lv.100', lv120: 'Lv.120',
  st_health: 'HP', st_armor: 'Giáp', st_reload: 'Nạp đạn', st_luck: 'May mắn', st_firepower: 'Hoả lực', st_torpedo: 'Ngư lôi', st_evasion: 'Né tránh', st_speed: 'Tốc độ', st_antiair: 'Phòng không', st_aviation: 'Không quân', st_oil: 'Tiêu hao dầu', st_accuracy: 'Độ chính xác', st_asw: 'Chống ngầm'
}


const enX = {
  loading: 'Loading fleet data…', loadErr: 'Could not load the fleet data. Check your connection.', retry: 'Retry',
  show: 'Collection', showAll: 'All ships', showFav: 'Favorites', showOwned: 'Owned', showMissing: 'Not owned',
  fav: 'Add to favorites', unfav: 'Remove from favorites', own: 'Mark as owned', unown: 'Unmark as owned', favorite: 'Favorite', owned: 'Owned', ownedProgress: 'Owned {n} / {m}',
  select: 'Select', selectOff: 'Exit select mode', selected: '{n} selected', copyNames: 'Copy names', compare: 'Compare', bulkOwn: 'Mark owned', bulkFav: 'Favorite', copiedMany: 'Copied {n} names', cmpLimit: 'Select 2–3 ships to compare', selectHint: 'Select ships',
  compareTitle: 'Compare ships', density: 'Card density', comfy: 'Comfortable', compact: 'Compact',
  collab: 'Crossover ships', collabDesc: 'Show ships from collaboration events (Hololive, Bilibili, …).',
  nameLang: 'Ship name language', nameAuto: 'Auto',
  backup: 'Backup', backupDesc: 'Save or restore your settings, favorites and owned ships.', exportBackup: 'Export backup', importBackup: 'Import backup', importOk: 'Backup restored', importErr: 'That file is not a valid backup',
  install: 'Install app', installDesc: 'Install this site as an app for quick, offline access.',
  updateReady: 'A new version is available.', refresh: 'Refresh', later: 'Later', offline: 'You are offline. Cached data is still available.', online: 'Back online', offlineReady: 'Ready to work offline',
  tabOverview: 'Overview', tabSkills: 'Skills', tabSkins: 'Skins', tabObtain: 'Obtain',
  equip: 'Equipment slots', obtain: 'How to obtain', construction: 'Construction', noData: 'No information available.', loadingExtra: 'Loading…', zoom: 'View full artwork', radar: 'Overview',
  copyLang: 'Copy {lang} name', scopeSelected: 'Selected ({n})', scSelect: 'Toggle select mode', filtersSheet: 'Filters', imgCard: 'Portrait', imgArt: 'Full art', prevImage: 'Previous image', nextImage: 'Next image', yes: 'Yes', no: 'No'
}
const viX = {
  loading: 'Đang tải dữ liệu hạm đội…', loadErr: 'Không tải được dữ liệu. Hãy kiểm tra kết nối mạng.', retry: 'Thử lại',
  show: 'Bộ sưu tập', showAll: 'Tất cả nhân vật', showFav: 'Yêu thích', showOwned: 'Đã sở hữu', showMissing: 'Chưa sở hữu',
  fav: 'Thêm vào yêu thích', unfav: 'Bỏ yêu thích', own: 'Đánh dấu đã sở hữu', unown: 'Bỏ đánh dấu sở hữu', favorite: 'Yêu thích', owned: 'Đã sở hữu', ownedProgress: 'Đã sở hữu {n} / {m}',
  select: 'Chọn', selectOff: 'Thoát chế độ chọn', selected: 'Đã chọn {n}', copyNames: 'Sao chép tên', compare: 'So sánh', bulkOwn: 'Đánh dấu sở hữu', bulkFav: 'Yêu thích', copiedMany: 'Đã sao chép {n} tên', cmpLimit: 'Chọn 2–3 nhân vật để so sánh', selectHint: 'Chọn nhân vật',
  compareTitle: 'So sánh nhân vật', density: 'Mật độ card', comfy: 'Thoải mái', compact: 'Gọn',
  collab: 'Nhân vật collab', collabDesc: 'Hiển thị nhân vật từ các sự kiện hợp tác (Hololive, Bilibili, …).',
  nameLang: 'Ngôn ngữ tên nhân vật', nameAuto: 'Tự động',
  backup: 'Sao lưu', backupDesc: 'Lưu hoặc khôi phục cài đặt, danh sách yêu thích và nhân vật đã sở hữu.', exportBackup: 'Xuất bản sao lưu', importBackup: 'Nhập bản sao lưu', importOk: 'Đã khôi phục bản sao lưu', importErr: 'File không phải bản sao lưu hợp lệ',
  install: 'Cài đặt ứng dụng', installDesc: 'Cài trang này thành ứng dụng để mở nhanh và dùng offline.',
  updateReady: 'Đã có phiên bản mới.', refresh: 'Cập nhật', later: 'Để sau', offline: 'Bạn đang offline. Dữ liệu đã lưu vẫn dùng được.', online: 'Đã có mạng trở lại', offlineReady: 'Sẵn sàng dùng offline',
  tabOverview: 'Tổng quan', tabSkills: 'Kỹ năng', tabSkins: 'Skin', tabObtain: 'Cách nhận',
  equip: 'Ô trang bị', obtain: 'Cách nhận', construction: 'Chế tạo', noData: 'Chưa có thông tin.', loadingExtra: 'Đang tải…', zoom: 'Xem ảnh đầy đủ', radar: 'Tổng quan',
  copyLang: 'Sao chép tên {lang}', scopeSelected: 'Đã chọn ({n})', scSelect: 'Bật/tắt chế độ chọn', filtersSheet: 'Bộ lọc', imgCard: 'Chân dung', imgArt: 'Toàn thân', prevImage: 'Ảnh trước', nextImage: 'Ảnh sau', yes: 'Có', no: 'Không'
}
const ja = {
  brandSub: 'シップガール一覧', heroTag: '艦隊データベース', heroDesc: 'アズールレーンの全艦船を閲覧。レアリティ・陣営・艦種で絞り込み、ステータス確認や一覧のエクスポートができます。',
  pillShips: '艦船', pillFactions: '陣営', pillTypes: '艦種', search: '名前・艦級・IDで検索…', clearSearch: '検索をクリア', filters: 'フィルター',
  rarity: 'レアリティ', nation: '陣営', hull: '艦種', sort: '並び替え', allFactions: 'すべての陣営', allTypes: 'すべての艦種', resetFilters: 'フィルターをリセット',
  sortRarityDesc: 'レアリティ: 高→低', sortRarityAsc: 'レアリティ: 低→高', sortNameAsc: '名前: A→Z', sortNameDesc: '名前: Z→A', sortStars: '星: 高→低',
  showing: '{m}隻中 {n}隻を表示', grid: 'グリッド表示', list: 'リスト表示', settings: '設定', export: 'エクスポート', copyName: '名前をコピー', copiedOk: '「{name}」をコピーしました', copyFail: 'コピーできませんでした',
  details: '詳細を見る', close: '閉じる', cancel: 'キャンセル', done: '完了', backTop: 'ページ上部へ', loadMore: 'さらに読み込む', empty: '艦船が見つかりません', emptyHint: '別のキーワードを試すか、フィルターを解除してください。',
  exportTitle: '艦船リストをエクスポート', exportDesc: '対象と形式を選択してください。', scopeFiltered: '絞り込み ({n})', scopeAll: 'すべて ({n})', scopeSelected: '選択中 ({n})', csv: 'CSVをダウンロード', json: 'JSONをダウンロード',
  exportOk: '{n}隻を{fmt}で書き出しました', exportEmpty: '書き出す艦船がありません', themeMode: 'テーマ', light: 'ライト', dark: 'ダーク', system: 'システム', accent: 'テーマカラー',
  fontSize: '文字サイズ', small: '小', medium: '中', large: '大', language: '言語', font: 'フォント', resetSettings: '設定をリセット', resetTitle: 'すべての設定をリセットしますか？', resetDesc: 'テーマ・色・文字サイズ・言語・フォントが初期値に戻ります。', reset: 'リセット', settingsReset: '設定を初期化しました',
  author: '作者', withAI: 'AIのサポート:', names: '名称', info: '情報', stats: 'ステータス', wiki: 'Wikiを開く', class: '艦級', build: '建造時間', artist: 'イラスト', voice: '声優',
  st_health: '耐久', st_armor: '装甲', st_reload: '装填', st_luck: '運', st_firepower: '火力', st_torpedo: '雷装', st_evasion: '回避', st_speed: '速力', st_antiair: '対空', st_aviation: '航空', st_oil: '消費燃料', st_accuracy: '命中', st_asw: '対潜',
  show: 'コレクション', showAll: 'すべて', showFav: 'お気に入り', showOwned: '所持', showMissing: '未所持', fav: 'お気に入りに追加', unfav: 'お気に入りを解除', own: '所持にする', unown: '所持を解除', favorite: 'お気に入り', owned: '所持', ownedProgress: '所持 {n} / {m}',
  select: '選択', selected: '{n}件選択', copyNames: '名前をコピー', compare: '比較', compareTitle: '艦船を比較', density: 'カード密度', comfy: 'ゆったり', compact: 'コンパクト', nameLang: '艦船名の言語', nameAuto: '自動',
  backup: 'バックアップ', exportBackup: 'バックアップを書き出す', importBackup: 'バックアップを読み込む', importOk: '復元しました', importErr: '無効なバックアップファイルです', install: 'アプリをインストール',
  tabOverview: '概要', tabSkills: 'スキル', tabSkins: 'スキン', tabObtain: '入手', shortcuts: 'キーボードショートカット', prev: '前の艦船', next: '次の艦船', loading: '艦隊データを読み込み中…', retry: '再試行'
}
const zh = {
  brandSub: '舰娘图鉴', heroTag: '舰队数据库', heroDesc: '浏览碧蓝航线全部舰娘：按稀有度、阵营、舰种筛选，查看属性并导出列表。',
  pillShips: '舰船', pillFactions: '阵营', pillTypes: '舰种', search: '按名称、舰级或 ID 搜索…', clearSearch: '清除搜索', filters: '筛选',
  rarity: '稀有度', nation: '阵营', hull: '舰种', sort: '排序', allFactions: '全部阵营', allTypes: '全部舰种', resetFilters: '重置筛选',
  sortRarityDesc: '稀有度：高→低', sortRarityAsc: '稀有度：低→高', sortNameAsc: '名称：A→Z', sortNameDesc: '名称：Z→A', sortStars: '星级：高→低',
  showing: '显示 {n} / {m} 艘', grid: '网格视图', list: '列表视图', settings: '设置', export: '导出', copyName: '复制名称', copiedOk: '已复制“{name}”', copyFail: '无法复制到剪贴板',
  details: '查看详情', close: '关闭', cancel: '取消', done: '完成', backTop: '回到顶部', loadMore: '加载更多', empty: '未找到舰船', emptyHint: '试试其他关键词或清除部分筛选。',
  exportTitle: '导出舰船列表', exportDesc: '选择导出范围和文件格式。', scopeFiltered: '当前筛选 ({n})', scopeAll: '全部 ({n})', scopeSelected: '已选 ({n})', csv: '下载 CSV', json: '下载 JSON',
  exportOk: '已导出 {n} 艘舰船（{fmt}）', exportEmpty: '当前没有可导出的舰船', themeMode: '主题模式', light: '浅色', dark: '深色', system: '跟随系统', accent: '主题色',
  fontSize: '字号', small: '小', medium: '中', large: '大', language: '语言', font: '字体', resetSettings: '重置设置', resetTitle: '重置所有设置？', resetDesc: '主题、颜色、字号、语言和字体将恢复默认。', reset: '重置', settingsReset: '设置已恢复默认',
  author: '作者', withAI: 'AI 协助：', names: '名称', info: '信息', stats: '属性', wiki: '打开 Wiki', class: '舰级', build: '建造时间', artist: '画师', voice: '声优',
  st_health: '耐久', st_armor: '装甲', st_reload: '装填', st_luck: '幸运', st_firepower: '炮击', st_torpedo: '雷击', st_evasion: '机动', st_speed: '航速', st_antiair: '防空', st_aviation: '航空', st_oil: '耗油', st_accuracy: '命中', st_asw: '反潜',
  show: '收藏', showAll: '全部', showFav: '喜欢', showOwned: '已拥有', showMissing: '未拥有', fav: '加入喜欢', unfav: '取消喜欢', own: '标记为已拥有', unown: '取消已拥有', favorite: '喜欢', owned: '已拥有', ownedProgress: '已拥有 {n} / {m}',
  select: '选择', selected: '已选 {n} 项', copyNames: '复制名称', compare: '对比', compareTitle: '舰船对比', density: '卡片密度', comfy: '宽松', compact: '紧凑', nameLang: '舰船名称语言', nameAuto: '自动',
  backup: '备份', exportBackup: '导出备份', importBackup: '导入备份', importOk: '备份已恢复', importErr: '无效的备份文件', install: '安装应用',
  tabOverview: '概览', tabSkills: '技能', tabSkins: '皮肤', tabObtain: '获取', shortcuts: '键盘快捷键', prev: '上一艘', next: '下一艘', loading: '正在加载舰队数据…', retry: '重试'
}
const ko = {
  brandSub: '함순 도감', heroTag: '함대 데이터베이스', heroDesc: '벽람항로의 모든 함선을 둘러보세요. 희귀도·진영·함종으로 필터링하고 능력치를 확인하며 목록을 내보낼 수 있습니다.',
  pillShips: '함선', pillFactions: '진영', pillTypes: '함종', search: '이름, 함급, ID로 검색…', clearSearch: '검색 지우기', filters: '필터',
  rarity: '희귀도', nation: '진영', hull: '함종', sort: '정렬', allFactions: '모든 진영', allTypes: '모든 함종', resetFilters: '필터 초기화',
  sortRarityDesc: '희귀도: 높은 순', sortRarityAsc: '희귀도: 낮은 순', sortNameAsc: '이름: A→Z', sortNameDesc: '이름: Z→A', sortStars: '별: 높은 순',
  showing: '{m}척 중 {n}척 표시', grid: '그리드 보기', list: '목록 보기', settings: '설정', export: '내보내기', copyName: '이름 복사', copiedOk: '“{name}” 복사됨', copyFail: '클립보드에 복사할 수 없습니다',
  details: '상세 보기', close: '닫기', cancel: '취소', done: '완료', backTop: '맨 위로', loadMore: '더 보기', empty: '함선을 찾을 수 없습니다', emptyHint: '다른 키워드를 입력하거나 필터를 해제해 보세요.',
  exportTitle: '함선 목록 내보내기', exportDesc: '범위와 파일 형식을 선택하세요.', scopeFiltered: '필터 결과 ({n})', scopeAll: '전체 ({n})', scopeSelected: '선택됨 ({n})', csv: 'CSV 다운로드', json: 'JSON 다운로드',
  exportOk: '{n}척을 {fmt}로 내보냈습니다', exportEmpty: '내보낼 함선이 없습니다', themeMode: '테마 모드', light: '라이트', dark: '다크', system: '시스템', accent: '테마 색상',
  fontSize: '글자 크기', small: '작게', medium: '보통', large: '크게', language: '언어', font: '글꼴', resetSettings: '설정 초기화', resetTitle: '모든 설정을 초기화할까요?', resetDesc: '테마, 색상, 글자 크기, 언어, 글꼴이 기본값으로 돌아갑니다.', reset: '초기화', settingsReset: '설정을 초기화했습니다',
  author: '제작자', withAI: 'AI 지원:', names: '이름', info: '정보', stats: '능력치', wiki: '위키 열기', class: '함급', build: '건조 시간', artist: '일러스트', voice: '성우',
  st_health: '내구', st_armor: '장갑', st_reload: '장전', st_luck: '운', st_firepower: '화력', st_torpedo: '뇌장', st_evasion: '회피', st_speed: '속도', st_antiair: '대공', st_aviation: '항공', st_oil: '유류 소비', st_accuracy: '명중', st_asw: '대잠',
  show: '컬렉션', showAll: '전체', showFav: '즐겨찾기', showOwned: '보유', showMissing: '미보유', fav: '즐겨찾기에 추가', unfav: '즐겨찾기 해제', own: '보유로 표시', unown: '보유 해제', favorite: '즐겨찾기', owned: '보유', ownedProgress: '보유 {n} / {m}',
  select: '선택', selected: '{n}개 선택', copyNames: '이름 복사', compare: '비교', compareTitle: '함선 비교', density: '카드 밀도', comfy: '여유롭게', compact: '촘촘하게', nameLang: '함선 이름 언어', nameAuto: '자동',
  backup: '백업', exportBackup: '백업 내보내기', importBackup: '백업 가져오기', importOk: '백업을 복원했습니다', importErr: '올바른 백업 파일이 아닙니다', install: '앱 설치',
  tabOverview: '개요', tabSkills: '스킬', tabSkins: '스킨', tabObtain: '획득', shortcuts: '키보드 단축키', prev: '이전 함선', next: '다음 함선', loading: '함대 데이터를 불러오는 중…', retry: '다시 시도'
}

const VI_VAL = {
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


const L = { lv1: 'Lv.1', lv100: 'Lv.100', lv120: 'Lv.120', id: 'ID' }
const jaX = { ...L,
  appearance: '外観', data: 'データ', dataDesc: '艦船データは AzurAPI のデータセットとアズールレーン Wiki を元にしています。', stars: '星',
  scSearch: '検索欄にフォーカス', scClear: '検索をクリア／検索欄を離れる', scView: 'グリッド／リスト切り替え', scExport: 'エクスポートを開く', scSettings: '設定を開く', scTheme: 'テーマモードを切り替え', scNav: '詳細で前／次の艦船へ', scHelp: 'このヘルプを表示', scSelect: '選択モードの切り替え',
  loadErr: '艦隊データを読み込めませんでした。接続を確認してください。', selectOff: '選択モードを終了', bulkOwn: '所持にする', bulkFav: 'お気に入り', copiedMany: '{n}件の名前をコピーしました', cmpLimit: '比較する艦船を2〜3隻選択', selectHint: '艦船を選択',
  collab: 'コラボ艦', collabDesc: 'コラボイベントの艦船（ホロライブ、Bilibili など）を表示します。', backupDesc: '設定・お気に入り・所持艦を保存または復元します。', installDesc: 'このサイトをアプリとしてインストールし、すばやくオフラインでも利用できます。',
  updateReady: '新しいバージョンがあります。', refresh: '更新', later: 'あとで', offline: 'オフラインです。保存済みのデータは利用できます。', online: 'オンラインに復帰しました', offlineReady: 'オフラインで利用できます',
  equip: '装備スロット', obtain: '入手方法', construction: '建造', noData: '情報がありません。', loadingExtra: '読み込み中…', zoom: 'イラストを拡大', radar: '概要', copyLang: '{lang}の名前をコピー', filtersSheet: 'フィルター', imgCard: 'アイコン', imgArt: '立ち絵', prevImage: '前の画像', nextImage: '次の画像', yes: 'はい', no: 'いいえ' }
const zhX = { ...L,
  appearance: '外观', data: '数据', dataDesc: '舰船数据来自 AzurAPI 数据集和碧蓝航线 Wiki。', stars: '星级',
  scSearch: '聚焦搜索框', scClear: '清除搜索 / 离开搜索框', scView: '切换网格 / 列表', scExport: '打开导出', scSettings: '打开设置', scTheme: '切换主题模式', scNav: '详情中上一艘 / 下一艘', scHelp: '显示此帮助', scSelect: '切换选择模式',
  loadErr: '无法加载舰队数据，请检查网络连接。', selectOff: '退出选择模式', bulkOwn: '标记已拥有', bulkFav: '加入喜欢', copiedMany: '已复制 {n} 个名称', cmpLimit: '选择 2–3 艘舰船进行对比', selectHint: '选择舰船',
  collab: '联动舰船', collabDesc: '显示联动活动中的舰船（Hololive、Bilibili 等）。', backupDesc: '保存或恢复设置、喜欢列表和已拥有的舰船。', installDesc: '将本站安装为应用，快速访问并支持离线使用。',
  updateReady: '有新版本可用。', refresh: '刷新', later: '稍后', offline: '你已离线，已缓存的数据仍可使用。', online: '网络已恢复', offlineReady: '已可离线使用',
  equip: '装备栏', obtain: '获取方式', construction: '建造', noData: '暂无信息。', loadingExtra: '加载中…', zoom: '查看完整立绘', radar: '概览', copyLang: '复制{lang}名称', filtersSheet: '筛选', imgCard: '头像', imgArt: '立绘', prevImage: '上一张', nextImage: '下一张', yes: '是', no: '否' }
const koX = { ...L,
  appearance: '화면', data: '데이터', dataDesc: '함선 데이터는 AzurAPI 데이터셋과 벽람항로 위키를 기반으로 합니다.', stars: '별',
  scSearch: '검색창 포커스', scClear: '검색 지우기 / 검색창 나가기', scView: '그리드 / 목록 전환', scExport: '내보내기 열기', scSettings: '설정 열기', scTheme: '테마 모드 전환', scNav: '상세에서 이전 / 다음 함선', scHelp: '이 도움말 보기', scSelect: '선택 모드 전환',
  loadErr: '함대 데이터를 불러오지 못했습니다. 연결을 확인하세요.', selectOff: '선택 모드 종료', bulkOwn: '보유로 표시', bulkFav: '즐겨찾기', copiedMany: '{n}개의 이름을 복사했습니다', cmpLimit: '비교할 함선을 2~3척 선택하세요', selectHint: '함선 선택',
  collab: '콜라보 함선', collabDesc: '콜라보 이벤트 함선(홀로라이브, Bilibili 등)을 표시합니다.', backupDesc: '설정, 즐겨찾기, 보유 함선을 저장하거나 복원합니다.', installDesc: '이 사이트를 앱으로 설치해 빠르게 열고 오프라인에서도 사용하세요.',
  updateReady: '새 버전이 있습니다.', refresh: '새로고침', later: '나중에', offline: '오프라인 상태입니다. 저장된 데이터는 계속 사용할 수 있습니다.', online: '다시 온라인입니다', offlineReady: '오프라인에서 사용할 수 있습니다',
  equip: '장비 슬롯', obtain: '획득 방법', construction: '건조', noData: '정보가 없습니다.', loadingExtra: '불러오는 중…', zoom: '일러스트 크게 보기', radar: '개요', copyLang: '{lang} 이름 복사', filtersSheet: '필터', imgCard: '초상', imgArt: '일러스트', prevImage: '이전 이미지', nextImage: '다음 이미지', yes: '예', no: '아니요' }

const JA_VAL = {
  hull: { Destroyer: '駆逐艦', 'Light Cruiser': '軽巡洋艦', 'Heavy Cruiser': '重巡洋艦', Battleship: '戦艦', 'Aircraft Carrier': '航空母艦', 'Light Carrier': '軽空母', Submarine: '潜水艦', Battlecruiser: '巡洋戦艦', 'Large Cruiser': '超巡洋艦', Monitor: 'モニター艦', 'Munition Ship': '弾薬補給艦', Repair: '工作艦', 'Submarine Carrier': '潜水空母', 'Sailing Frigate': '帆走フリゲート' },
  nat: { 'Sakura Empire': '重桜', 'Eagle Union': 'ユニオン', 'Royal Navy': 'ロイヤル', 'Iron Blood': '鉄血', 'Sardegna Empire': 'サディア帝国', 'Northern Parliament': '北連', 'Dragon Empery': '東煌', 'Vichya Dominion': 'ヴィシア聖座', 'Iris Libre': 'アイリス教国', Universal: '汎用', 'The Idolmaster': 'アイドルマスター', 'Venus Vacation': 'ヴィーナスヴァケーション', Utawarerumono: 'うたわれるもの', 'Atelier Ryza': 'ライザのアトリエ', Neptunia: 'ネプテューヌ', 'Kizuna AI': 'キズナアイ', Hololive: 'ホロライブ' },
  rarity: { Normal: 'ノーマル', Rare: 'レア', Elite: 'エリート', 'Super Rare': 'スーパーレア', 'Ultra Rare': 'ウルトラレア', Priority: '最優先', Decisive: '決戦' }
}
const ZH_VAL = {
  hull: { Destroyer: '驱逐', 'Light Cruiser': '轻巡', 'Heavy Cruiser': '重巡', Battleship: '战列', 'Aircraft Carrier': '航母', 'Light Carrier': '轻航', Submarine: '潜艇', Battlecruiser: '战巡', 'Large Cruiser': '超巡', Monitor: '浅水重炮舰', 'Munition Ship': '运输舰', Repair: '维修舰', 'Submarine Carrier': '潜母', 'Sailing Frigate': '风帆护卫舰' },
  nat: { 'Sakura Empire': '重樱', 'Eagle Union': '白鹰', 'Royal Navy': '皇家', 'Iron Blood': '铁血', 'Sardegna Empire': '撒丁帝国', 'Northern Parliament': '北方联合', 'Dragon Empery': '东煌', 'Vichya Dominion': '维希教廷', 'Iris Libre': '鸢尾教国', Universal: '通用', 'The Idolmaster': '偶像大师', 'Venus Vacation': '维纳斯假期', Utawarerumono: '传颂之物', 'Atelier Ryza': '莱莎的炼金工房', Neptunia: '战机少女', 'Kizuna AI': '绊爱', Hololive: 'Hololive' },
  rarity: { Normal: '普通', Rare: '稀有', Elite: '精锐', 'Super Rare': '超稀有', 'Ultra Rare': '海上传奇', Priority: '最优先', Decisive: '决战' }
}
const KO_VAL = {
  hull: { Destroyer: '구축함', 'Light Cruiser': '경순양함', 'Heavy Cruiser': '중순양함', Battleship: '전함', 'Aircraft Carrier': '항공모함', 'Light Carrier': '경항공모함', Submarine: '잠수함', Battlecruiser: '순양전함', 'Large Cruiser': '대형순양함', Monitor: '모니터함', 'Munition Ship': '탄약함', Repair: '공작함', 'Submarine Carrier': '잠수항모', 'Sailing Frigate': '범선 프리깃' },
  nat: { Universal: '범용', 'The Idolmaster': '아이돌마스터', Hololive: '홀로라이브' },
  rarity: { Normal: '일반', Rare: '희귀', Elite: '정예', 'Super Rare': '초희귀', 'Ultra Rare': '울트라 레어', Priority: '최우선', Decisive: '결전' }
}
export const VALS = { vi: VI_VAL, ja: JA_VAL, zh: ZH_VAL, ko: KO_VAL }
const VAL = VALS
const EN = { ...en, ...enX }
export const LANGS = [
  { value: 'en', label: 'English' }, { value: 'vi', label: 'Tiếng Việt' }, { value: 'ja', label: '日本語' },
  { value: 'zh', label: '简体中文' }, { value: 'ko', label: '한국어' }
]
export const DICTS = { en: EN, vi: { ...vi, ...viX }, ja: { ...ja, ...jaX }, zh: { ...zh, ...zhX }, ko: { ...ko, ...koX } }
const Ctx = createContext(null)

export function I18nProvider({ lang, children }) {
  const v = useMemo(() => ({
    lang,
    t: (k, p) => {
      let s = DICTS[lang]?.[k] ?? EN[k] ?? k
      if (p) for (const x in p) s = s.replace(`{${x}}`, p[x])
      return s
    },
    tv: (g, x) => VAL[lang]?.[g]?.[x] || x
  }), [lang])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
