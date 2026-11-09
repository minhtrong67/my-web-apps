const COLS = ['id', 'name', 'name_ja', 'name_zh', 'name_ko', 'rarity', 'element', 'specialty', 'attack', 'faction', 'favorite', 'image']
const flat = (a) => ({ id: a.id, name: a.name, name_ja: a.names?.ja || '', name_zh: a.names?.zh || '', name_ko: a.names?.ko || '', rarity: a.rarity, element: a.element, specialty: a.specialty, attack: a.attack || '', faction: a.faction || '', favorite: a.favorite ? 'true' : 'false', image: a.image || '' })

export const toJSON = (rows) => JSON.stringify(rows.map((a) => ({
  id: a.id, name: a.name, names: a.names, rarity: a.rarity, element: a.element, specialty: a.specialty, attack: a.attack || null, faction: a.faction || null, favorite: !!a.favorite, image: a.image || null
})), null, 2)

const esc = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
// BOM để Excel đọc đúng UTF-8 (tên tiếng Nhật/Trung/Hàn)
export const toCSV = (rows) => '\uFEFF' + [COLS.join(','), ...rows.map(flat).map((r) => COLS.map((c) => esc(r[c])).join(','))].join('\r\n')

export function download(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
