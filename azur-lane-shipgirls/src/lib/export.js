const esc = (v) => {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function rows(list, col) {
  return list.map((s) => {
    const l = s.s[2] || []
    return {
      id: s.id, name_en: s.n.en, name_cn: s.n.cn, name_jp: s.n.jp, name_kr: s.n.kr, code: s.n.code,
      class: s.cls, nationality: s.nat, hull_type: s.hull, rarity: s.r, stars: s.st,
      construction_time: s.ct, artist: s.artist, voice_actor: s.va,
      ...(col ? { owned: col.own.has(s.id) ? 'yes' : 'no', favorite: col.fav.has(s.id) ? 'yes' : 'no' } : {}),
      lv120_health: l[0] ?? '', lv120_armor: l[1] ?? '', lv120_reload: l[2] ?? '', lv120_luck: l[3] ?? '',
      lv120_firepower: l[4] ?? '', lv120_torpedo: l[5] ?? '', lv120_evasion: l[6] ?? '', lv120_speed: l[7] ?? '',
      lv120_antiair: l[8] ?? '', lv120_aviation: l[9] ?? '', lv120_accuracy: l[11] ?? '', lv120_asw: l[12] ?? '',
      thumbnail: s.th[0], wiki: s.wiki
    }
  })
}

export function toCSV(list, col) {
  const r = rows(list, col)
  const h = Object.keys(r[0])
  // BOM so Excel opens UTF-8 (Vietnamese / CJK) correctly
  return '\ufeff' + [h.join(','), ...r.map((o) => h.map((k) => esc(o[k])).join(','))].join('\r\n')
}

export const toJSON = (list, col) => JSON.stringify(rows(list, col), null, 2)

export function download(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}
