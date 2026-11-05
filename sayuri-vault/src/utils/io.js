import Papa from 'papaparse'

const save = (content, name, type) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name; a.click(); URL.revokeObjectURL(a.href)
}
const pick = (rows, fields) => rows.map((r) => Object.fromEntries(fields.map((f) => [f.key, r[f.key] ?? ''])))

export const exportCSV = (rows, fields, name) => save('\uFEFF' + Papa.unparse(pick(rows, fields)), `${name}.csv`, 'text/csv;charset=utf-8')
export const exportJSON = (rows, fields, name) => save(JSON.stringify(pick(rows, fields), null, 2), `${name}.json`, 'application/json')

// Đọc file .csv hoặc .json → mảng object thô
export async function parseFile(file) {
  const text = await file.text()
  if (/\.json$/i.test(file.name) || file.type === 'application/json') {
    const j = JSON.parse(text)
    return Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : Object.values(j || {}).find(Array.isArray) || []
  }
  return Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.replace(/^\uFEFF/, '').trim() }).data
}

export function normalize(raw, fields) {
  const valid = [], invalid = []
  raw.forEach((x) => {
    const o = Object.fromEntries(fields.map((f) => [f.key, String(x?.[f.key] ?? '').trim()]))
    fields.every((f) => !f.required || o[f.key]) ? valid.push(o) : invalid.push(x)
  })
  return { valid, invalid }
}
