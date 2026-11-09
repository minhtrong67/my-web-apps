// Nguồn dữ liệu: Nanoka (nanoka.cc, tiền thân Hakush.in) — cùng nguồn với Akademiya.
// Ứng dụng tải danh sách agent trực tiếp từ API, lưu cache localStorage và dùng SNAPSHOT bên dưới khi offline lần đầu.
export const BASE = 'https://static.nanoka.cc'
export const asset = (f) => `${BASE}/assets/zzz/${f}.webp`

export const ELEMENTS = { Physical: '#f5c542', Fire: '#ff5a3c', Ice: '#6fd8ff', Electric: '#4d8bff', Ether: '#ff4fa3', Wind: '#3ee0a1', Lumiflux: '#c8a2ff' }
export const SPECIALTIES = ['Attack', 'Stun', 'Anomaly', 'Support', 'Defense', 'Rupture', 'Armorer']
export const ATTACKS = ['Slash', 'Strike', 'Pierce']
const ELEM = { 200: 'Physical', 201: 'Fire', 202: 'Ice', 203: 'Electric', 204: 'Wind', 205: 'Ether', 300: 'Lumiflux' }
const SPEC = { 1: 'Attack', 2: 'Stun', 3: 'Anomaly', 4: 'Support', 5: 'Defense', 6: 'Rupture', 7: 'Armorer' }
const HIT = { 101: 'Slash', 102: 'Strike', 103: 'Pierce' }
const RANK = { 4: 'S', 3: 'A' }
const SKIP = new Set(['2011', '2021']) // nhân vật chính (Belle/Wise)

// id|tên|thuộc tính|chuyên môn|độ hiếm  (lấy từ Akademiya)
const SNAPSHOT = `1391|Ju Fufu|Fire|Stun|S
1651|Kafka|Electric|Anomaly|S
1661|Robin|Ether|Defense|S
1601|Sunbringer|Fire|Armorer|S
1331|Vivian|Ether|Anomaly|S
1401|Alice|Physical|Anomaly|S
1011|Anby|Electric|Stun|A
1381|Anby (Attack)|Electric|Attack|S
1111|Anton|Electric|Attack|A
1501|Aria|Ether|Anomaly|S
1311|Astra Yao|Ether|Support|S
1471|Banyue|Fire|Rupture|S
1121|Ben|Fire|Defense|A
1081|Billy|Physical|Attack|A
1531|Billy (Rupture)|Physical|Rupture|S
1171|Burnice|Fire|Anomaly|S
1071|Caesar|Physical|Defense|S
1521|Cissia|Electric|Attack|S
1611|Claret|Electric|Armorer|S
1061|Corin|Physical|Attack|A
1481|Dialyn|Physical|Stun|S
1191|Ellen|Ice|Attack|S
1321|Evelyn|Fire|Attack|S
1181|Grace|Electric|Anomaly|S
1201|Harumasa|Electric|Attack|S
1291|Hugo|Ice|Attack|S
1261|Jane|Physical|Anomaly|S
1101|Koleda|Fire|Stun|S
1161|Lighter|Fire|Stun|S
1451|Lucia|Ether|Support|S
1151|Lucy|Fire|Support|A
1141|Lycaon|Ice|Stun|S
1441|Manato|Fire|Rupture|A
1091|Miyabi|Ice|Anomaly|S
1511|Nangong Yu|Ether|Stun|S
1021|Nekomata|Physical|Attack|S
1031|Nicole|Ether|Support|A
1571|Norma|Fire|Stun|S
1301|Orphie & Magus|Fire|Attack|S
1421|Pan Yinhu|Physical|Defense|A
1641|Phoenix|Fire|Anomaly|S
1281|Piper|Physical|Anomaly|A
1541|Promeia|Ice|Anomaly|S
1351|Pulchra|Physical|Stun|A
1551|Pyrois|Ether|Attack|S
1251|Qingyi|Electric|Stun|S
1581|Remielle|Lumiflux|Anomaly|S
1211|Rina|Electric|Support|S
1621|Roxy|Wind|Stun|S
1461|Seed|Electric|Attack|S
1271|Seth|Electric|Defense|A
1631|Severian|Wind|Attack|S
1591|Sigrid|Ice|Attack|S
1041|Soldier 11|Fire|Attack|S
1131|Soukaku|Ice|Support|A
1491|Sunna|Physical|Support|S
1361|Trigger|Electric|Stun|S
1561|Velina|Wind|Anomaly|S
1221|Yanagi|Electric|Anomaly|S
1431|Ye Shunguang|Physical|Attack|S
1051|Yidhari|Ice|Rupture|S
1371|Yixuan|Ether|Rupture|S
1411|Yuzuha|Physical|Support|S
1341|Zhao|Ice|Defense|S
1241|Zhu Yuan|Ether|Attack|S`

export const snapshot = SNAPSHOT.split('\n').map((l) => {
  const [id, name, element, specialty, rarity] = l.split('|')
  return { id: +id, name, names: { en: name }, element, specialty, rarity, attack: '', image: '', offline: true }
})

const CK = 'zzz-agents-cache'
export const cached = () => { try { return JSON.parse(localStorage.getItem(CK))?.data } catch { return null } }

const j = async (url) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}
let verP = null
export function version(fresh) {
  if (fresh || !verP) {
    verP = j(`${BASE}/manifest.json`).then((m) => {
      const z = m.zzz || {}
      return z.latest_version || z.latest || z.live_version || z.live
    }).catch((e) => { verP = null; throw e })
  }
  return verP
}
export async function fetchAgents() {
  const v = await version(true)
  const raw = await j(`${BASE}/zzz/${v}/character.json`)
  const data = Object.entries(raw).filter(([id]) => !SKIP.has(id)).map(([id, c]) => ({
    id: +id, name: c.en || c.code, names: { en: c.en, ja: c.ja, zh: c.zh, ko: c.ko },
    rarity: RANK[c.rank] || 'A', specialty: SPEC[c.type] || 'Attack', element: ELEM[c.element] || 'Physical',
    attack: HIT[c.hit] || '', image: c.icon ? asset(c.icon.replace('Role', 'RoleSelect')) : '',
    imageAlt: c.icon ? asset(c.icon.replace('Role', 'RoleCrop')) : '', banner: asset(`Mindscape_${id}_1`), desc: c.desc || ''
  }))
  if (!data.length) throw new Error('empty')
  localStorage.setItem(CK, JSON.stringify({ v, data }))
  return data
}
// API trả các trường như camp/element_type dạng { "<id>": "<tên>" } (hoặc 0) -> lấy tên
export const prop = (v) => {
  if (!v || typeof v !== 'object') return ''
  if (typeof v.name === 'string') return v.name
  const x = Object.values(v)[0]
  return typeof x === 'string' ? x : ''
}

// Phe phái chỉ có trong trang chi tiết -> gom dần và lưu localStorage
export const factions = (() => { try { return JSON.parse(localStorage.getItem('zzz-factions')) || {} } catch { return {} } })()
const subs = new Set()
let timer = null
export const subscribeFactions = (fn) => { subs.add(fn); return () => subs.delete(fn) }
function setFaction(id, name) {
  if (!name || factions[id] === name) return
  factions[id] = name
  localStorage.setItem('zzz-factions', JSON.stringify(factions))
  clearTimeout(timer); timer = setTimeout(() => subs.forEach((f) => f()), 120)
}

const dc = new Map()
export async function fetchDetail(id, lang = 'en') {
  const key = `${lang}:${id}`
  if (dc.has(key)) return dc.get(key)
  const v = await version()
  const d = await j(`${BASE}/zzz/${v}/${lang}/character/${id}.json`)
  dc.set(key, d)
  if (lang === 'en') setFaction(id, prop(d.camp))
  return d
}
export async function loadFactions(ids, conc = 4) {
  const todo = ids.filter((id) => !factions[id])
  let i = 0
  const worker = async () => { while (i < todo.length) { try { await fetchDetail(todo[i++], 'en') } catch { /* bỏ qua */ } } }
  await Promise.all(Array.from({ length: conc }, worker))
}
