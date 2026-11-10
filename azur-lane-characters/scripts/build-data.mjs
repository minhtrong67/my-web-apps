// Builds src/data/ships.json (slim) from AzurAPI's ships.json.
// Usage: npm run data                         -> downloads the latest dataset
//        node scripts/build-data.mjs ./ships.json -> use a local copy
import fs from 'node:fs'

const SRC = 'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/ships.json'
const IMG = 'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/'
const K = ['health', 'armor', 'reload', 'luck', 'firepower', 'torpedo', 'evasion', 'speed', 'antiair', 'aviation', 'oilConsumption', 'accuracy', 'antisubmarineWarfare']

const arg = process.argv[2]
const raw = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(SRC)).json()

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

fs.mkdirSync('src/data', { recursive: true })
fs.writeFileSync('src/data/ships.json', JSON.stringify(out))
console.log(`Wrote ${out.length} ships (${(fs.statSync('src/data/ships.json').size / 1024).toFixed(0)} KB)`)
