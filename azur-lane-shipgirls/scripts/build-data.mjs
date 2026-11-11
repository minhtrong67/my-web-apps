// Builds src/data/ships.json (slim) from AzurAPI's ships.json.
// Usage: npm run data                         -> downloads the latest dataset
//        node scripts/build-data.mjs ./ships.json -> use a local copy
import fs from 'node:fs'

const SRC = 'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json'
const IMG = 'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/'
const K = ['health', 'armor', 'reload', 'luck', 'firepower', 'torpedo', 'evasion', 'speed', 'antiair', 'aviation', 'oilConsumption', 'accuracy', 'antisubmarineWarfare']

const arg = process.argv[2]
const all = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(SRC)).json()

// The upstream dataset sometimes contains the same ship twice under different ids
// (e.g. "Friedrich der Große": 20011 + Plan011). Keep the richest record per name/faction/type/rarity.
const richness = (s) => (s.skills?.length || 0) * 100 + Object.values(s.stats?.level120 || {}).reduce((n, v) => n + (parseFloat(v) || 0), 0)
const keep = new Map()
for (const s of all) {
  const k = [s.names?.en || s.id, s.nationality, s.hullType, s.rarity].join('|')
  const prev = keep.get(k)
  if (!prev) keep.set(k, s)
  else if (richness(s) > richness(prev)) { console.log(`dedupe: dropped ${prev.id}, kept ${s.id} (${s.names?.en})`); keep.set(k, s) }
  else console.log(`dedupe: dropped ${s.id}, kept ${prev.id} (${s.names?.en})`)
}
const raw = [...keep.values()]

const pick = (o) => (o ? K.map((k) => o[k] ?? '') : null)
const nm = (v) => (!v ? '' : typeof v === 'string' ? v : v.name || '')
const rel = (u) => (u ? u.replace(IMG, '') : '')

const out = raw.map((s) => ({
  id: s.id,
  n: {
    en: s.names?.en || s.names?.code || s.id,
    cn: s.names?.cn || '', jp: s.names?.jp || '', kr: s.names?.kr || '',
    code: s.names?.code || ''
  },
  cls: s.class || '', nat: s.nationality || '', hull: s.hullType || '',
  r: s.rarity, st: Number(s.stars) || 0,
  img: rel(s.thumbnail), art: rel(s.skins?.[0]?.image),
  s: [pick(s.stats?.baseStats), pick(s.stats?.level100), pick(s.stats?.level120)],
  ct: s.construction?.constructionTime || '',
  artist: nm(s.misc?.artist), va: nm(s.misc?.voice),
  wiki: s.wikiUrl || ''
}))

// Heavy details (skills, skins, obtain info, equipment slots) live in a separate, lazily loaded file.
const extra = {}
for (const s of raw) {
  extra[s.id] = {
    sk: (s.skills || []).map((k) => ({ n: k.names || {}, d: k.description || '', c: k.color || '', i: rel(k.icon) })),
    sn: (s.skins || []).map((k) => ({ n: k.name || '', i: rel(k.image), c: rel(k.chibi), t: k.info?.category || '' })),
    ob: s.obtainedFrom?.obtainedFrom || '',
    av: s.construction?.availableIn || null,
    sl: (s.slots || []).map((k) => [k.type, k.max, k.minEfficiency, k.maxEfficiency])
  }
}

fs.mkdirSync('src/data', { recursive: true })
fs.writeFileSync('src/data/extra.json', JSON.stringify(extra))
fs.writeFileSync('src/data/ships.json', JSON.stringify(out))
console.log(`Wrote ${out.length} ships (${(fs.statSync('src/data/ships.json').size / 1024).toFixed(0)} KB) + extra (${(fs.statSync('src/data/extra.json').size / 1024).toFixed(0)} KB)`)
