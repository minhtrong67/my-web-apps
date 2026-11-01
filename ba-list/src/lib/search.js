import { STUDENTS, norm, cap } from './students.js'

/* ===== Levenshtein (chịu lỗi gõ sai) ===== */
export const lev = (a, b) => {
  if (a === b) return 0
  const m = a.length, n = b.length
  if (Math.abs(m - n) > 2) return 3
  let p = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const c = [i]
    for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    p = c
  }
  return p[n]
}

/* ===== Cú pháp nâng cao: school:abydos, age>16, height<=155 ===== */
const NUM = { age: 'age', tuoi: 'age', height: 'height', cao: 'height' }
const TXT = {
  school: 'schoolL', truong: 'schoolL', role: 'roleL', weapon: 'weaponL', atk: 'atkL', arm: 'armL', pool: 'pool',
  cv: 'cv', seiyuu: 'cv', artist: 'illustrator', designer: 'designer', pos: 'posL', class: 'clsL', variant: 'variant',
}
export function parseQuery(q) {
  const f = [], t = []
  q.trim().split(/\s+/).filter(Boolean).forEach((w) => {
    let m
    if ((m = w.match(/^(age|tuoi|height|cao)(>=|<=|>|<|=|:)(\d+)$/i))) f.push({ n: NUM[m[1].toLowerCase()], o: m[2] === ':' ? '=' : m[2], v: +m[3] })
    else if ((m = w.match(/^(\w+):(.+)$/)) && TXT[m[1].toLowerCase()]) f.push({ t: TXT[m[1].toLowerCase()], v: norm(m[2]) })
    else t.push(norm(w))
  })
  return { f, t }
}
const matchFilter = (s, f) => {
  if (f.t) return norm(s[f.t]).includes(f.v)
  const x = s[f.n]
  if (x == null) return false
  return { '=': x === f.v, '>': x > f.v, '<': x < f.v, '>=': x >= f.v, '<=': x <= f.v }[f.o]
}
function scoreToken(s, t) {
  if (s.nm === t) return 100
  if (s.nm.startsWith(t)) return 70
  if (s.words.includes(t)) return 60
  if (s.words.some((w) => w.startsWith(t))) return 45
  if (s.nm.includes(t) || s.rm.includes(t)) return 32
  if (s.jp.includes(t)) return 30
  if (s.hay.includes(t)) return 12
  if (t.length > 3) {
    const d = t.length > 6 ? 2 : 1
    if (s.words.some((w) => lev(w, t) <= d)) return 8
  }
  return 0
}

/* ===== Nhóm bộ lọc ===== */
export const GRADE_ORDER = 'DCBAS'
export const GROUPS = [
  { k: 'school', l: 'schoolL', open: true }, { k: 'role', l: 'roleL', open: true }, { k: 'cls', l: 'clsL' }, { k: 'pos', l: 'posL' },
  { k: 'atk', l: 'atkL', open: true }, { k: 'arm', l: 'armL', open: true }, { k: 'weapon', l: 'weaponL' }, { k: 'rarity', kind: 'rarity' },
  { k: 'pool', kind: 'pool' }, { k: 'variant', kind: 'variant' }, { k: 'cover', kind: 'cover' },
  { k: 'urban', kind: 'grade' }, { k: 'outdoor', kind: 'grade' }, { k: 'indoor', kind: 'grade' }, { k: 'month', kind: 'month', asc: true },
]
export const emptySel = () => Object.fromEntries(GROUPS.map((g) => [g.k, []]))

/** Nhãn hiển thị của một giá trị trong nhóm lọc (phụ thuộc ngôn ngữ). */
export const valueLabel = (g, v, s, t) => {
  if (g.l) return s?.[g.l] ?? v
  switch (g.kind) {
    case 'rarity': return '★'.repeat(+v)
    case 'pool': return cap(String(v))
    case 'variant': return v === 'none' ? t('original') : cap(String(v))
    case 'cover': return String(v) === 'true' ? t('yes') : t('no')
    case 'month': return t('month', { n: v })
    default: return String(v)
  }
}

/** Các giá trị có thể chọn của từng nhóm: [{v, sample}] đã sắp xếp. */
export const GROUP_VALUES = Object.fromEntries(GROUPS.map((g) => {
  const m = new Map()
  STUDENTS.forEach((s) => {
    const v = s[g.k]
    if (v === '' || v == null || v === 0) return
    if (!m.has(String(v))) m.set(String(v), { v: String(v), raw: v, sample: s })
  })
  const a = [...m.values()].sort((x, y) => {
    if (g.kind === 'grade') return GRADE_ORDER.indexOf(y.v) - GRADE_ORDER.indexOf(x.v)
    if (g.l) return String(x.sample[g.l]).localeCompare(String(y.sample[g.l]))
    if (typeof x.raw === 'string') return x.v.localeCompare(y.v)
    return g.asc ? x.raw - y.raw : Number(y.raw) - Number(x.raw)
  })
  return [g.k, a]
}))

export const SORTS = ['name', 'rel', 'rarity', 'rjp', 'rgl', 'school', 'age', 'height', 'bd', 'urban', 'outdoor', 'indoor']
const sortValue = (s, k) => {
  const v = s[k]
  if (k === 'urban' || k === 'outdoor' || k === 'indoor') return GRADE_ORDER.indexOf(v)
  return typeof v === 'string' ? v.toLowerCase() : v
}
const isEmpty = (v) => v === '' || v == null

/** Lọc + tìm kiếm + sắp xếp. */
export function filterStudents({ q, sel, sort, dir, favOnly, favs }) {
  const parsed = parseQuery(q)
  const out = []
  for (const s of STUDENTS) {
    if (favOnly && !favs.has(s.name)) continue
    if (!GROUPS.every((g) => !sel[g.k].length || sel[g.k].includes(String(s[g.k])))) continue
    if (!parsed.f.every((f) => matchFilter(s, f))) continue
    let sc = 0
    for (const t of parsed.t) {
      const x = scoreToken(s, t)
      if (!x) { sc = -1; break }
      sc += x
    }
    if (sc < 0) continue
    out.push({ s, sc })
  }
  const rel = sort === 'rel' && parsed.t.length
  out.sort((A, B) => {
    const a = A.s, b = B.s
    if (rel) return B.sc - A.sc || a.name.localeCompare(b.name)
    const k = sort === 'rel' ? 'name' : sort, x = sortValue(a, k), y = sortValue(b, k)
    if (isEmpty(x) && isEmpty(y)) return a.name.localeCompare(b.name)
    if (isEmpty(x)) return 1
    if (isEmpty(y)) return -1
    return ((x < y ? -1 : x > y ? 1 : 0) * dir) || a.name.localeCompare(b.name)
  })
  return { list: out.map((o) => o.s), parsed }
}

/** Gợi ý "Có phải ý bạn là…" khi không có kết quả. */
const VOC = [...new Set(STUDENTS.flatMap((s) => s.words))]
export function suggest(parsed) {
  const t = parsed.t[0]
  if (!t || t.length < 3) return ''
  let best = '', d = 3
  for (const w of VOC) { const x = lev(t, w); if (x < d) { d = x; best = w } }
  return d <= 2 && best !== t ? best : ''
}
