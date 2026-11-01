import RAW from '../data/students.js'

/* ===== Chuẩn hóa chuỗi để tìm kiếm ===== */
export const norm = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()

export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '')

/* ===== Danh sách học sinh + trường tính sẵn cho tìm kiếm ===== */
export const STUDENTS = RAW.map((s, i) => {
  const nm = norm(s.name), rm = norm(s.romaji), jp = norm(s.ja)
  return {
    ...s,
    i,
    month: s.bd ? +s.bd.slice(0, 2) : 0,
    nm, rm, jp,
    words: [...new Set((nm + ' ' + rm).split(/[\s()]+/).filter(Boolean))],
    hay: norm([s.name, s.romaji, s.ja, s.cv, s.hobbies, s.designer, s.illustrator, s.lobby, s.schoolL, s.weaponL, s.roleL, s.atkL, s.armL, s.variant].join(' ')),
  }
})

export const BY_NAME = new Map(STUDENTS.map((s) => [s.name, s]))
export const fullName = (s) => s.romaji || s.name

/* ===== Ảnh (wiki) ===== */
const B = 'https://static.wikitide.net/bluearchivewiki/'
export const imgThumb = (p, w) => `${B}thumb/${p}/${w}px-${p.split('/').pop()}`
export const imgOrig = (p) => B + p
export const fmtDate = (d) => (d ? d.split('-').reverse().join('/') : '')

/* ===== Xuất JSON: bỏ các trường tính sẵn ===== */
export const cleanForExport = (s) => {
  // eslint-disable-next-line no-unused-vars
  const { i, hay, month, nm, rm, jp, words, sc, ...o } = s
  return { ...o, fullName: fullName(s) }
}
