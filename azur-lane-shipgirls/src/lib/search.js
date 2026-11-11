/** Lower-case, strip diacritics (incl. Vietnamese đ) so "algerie" matches "Algérie". */
export const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
export const tokens = (q) => norm(q).split(/[\s,]+/).filter(Boolean)

const subseq = (t, h) => { let i = 0; for (const c of h) if (c === t[i] && ++i === t.length) return true; return false }

/** Relevance score for a ship; -1 means "no match". Every token must match. */
export function score(s, toks) {
  if (!toks.length) return 0
  let sc = 0
  for (const t of toks) {
    if (s.nameN.startsWith(t)) sc += 4
    else if (s.nameN.includes(' ' + t)) sc += 3
    else if (s.nameN.includes(t)) sc += 2
    else if (s.hay.includes(t)) sc += 1
    else if (t.length >= 3 && subseq(t, s.nameN.replace(/\s/g, ''))) sc += 0.1 // fuzzy: "bsmk" -> Bismarck
    else return -1
  }
  return sc
}

/** [start, end) of the first matching token inside the original text (accent-insensitive). */
export function rangeOf(text, toks) {
  if (!toks.length || !text) return null
  let n = ''
  const map = []
  for (let i = 0; i < text.length; i++) for (const c of norm(text[i])) { n += c; map.push(i) }
  for (const t of toks) {
    const k = n.indexOf(t)
    if (k >= 0) return [map[k], map[k + t.length - 1] + 1]
  }
  return null
}
