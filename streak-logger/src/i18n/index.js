import vi from './vi'
import en from './en'

/**
 * Kho ngôn ngữ dùng chung cho cả React (qua LangContext) lẫn các hàm tiện ích
 * thuần JS (validation, ngày giờ, xuất tệp...). Nhờ vậy mọi chuỗi đều đi qua
 * một nơi duy nhất và không phải truyền `t` qua từng hàm.
 */
export const LANGUAGES = ['vi', 'en']
export const DEFAULT_LANG = 'vi'
export const LANG_STORAGE_KEY = 'streak-logger:lang'

const dictionaries = { vi, en }

function readStoredLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    return LANGUAGES.includes(saved) ? saved : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

let current = readStoredLang()

export const getLang = () => current

export function setCurrentLang(lang) {
  if (LANGUAGES.includes(lang)) current = lang
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/** Tra chuỗi theo khóa `a.b.c` và thay thế các biến dạng {tên}. Thiếu bản dịch thì dùng tiếng Việt rồi tới chính khóa. */
export function translate(path, vars) {
  let str = getByPath(dictionaries[current], path) ?? getByPath(dictionaries.vi, path) ?? path
  if (vars && typeof str === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replaceAll(`{${k}}`, v)
    })
  }
  return str
}

/** Mã locale dùng cho so sánh chuỗi và định dạng số. */
export const getLocale = () => (current === 'vi' ? 'vi' : 'en')
