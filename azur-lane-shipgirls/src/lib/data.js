import { createContext, useContext } from 'react'
import { norm } from './search.js'

export const RARITIES = ['Normal', 'Rare', 'Elite', 'Super Rare', 'Ultra Rare', 'Priority', 'Decisive']
const RANK = { Normal: 0, Rare: 1, Elite: 2, 'Super Rare': 3, Priority: 3, 'Ultra Rare': 4, Decisive: 4 }
const RAINBOW = 'linear-gradient(90deg,#f472b6,#facc15,#34d399,#38bdf8,#a78bfa)'

export const RAR = {
  Normal: { c: '#9ca3af' },
  Rare: { c: '#38bdf8' },
  Elite: { c: '#c084fc' },
  'Super Rare': { c: '#facc15' },
  'Ultra Rare': { c: '#f472b6', g: RAINBOW, rainbow: true },
  Priority: { c: '#fb923c', g: 'linear-gradient(90deg,#fb923c,#facc15)' },
  Decisive: { c: '#34d399', g: RAINBOW, rainbow: true }
}

// Order of values inside each stats array
export const STAT_KEYS = ['health', 'armor', 'reload', 'luck', 'firepower', 'torpedo', 'evasion', 'speed', 'antiair', 'aviation', 'oil', 'accuracy', 'asw']
// Stats shown as tiles (index into STAT_KEYS)
export const STAT_SHOW = [0, 4, 5, 9, 8, 2, 6, 11, 12, 7, 3, 10]
// Six axes used by the radar chart
export const RADAR_AXES = [0, 4, 5, 9, 8, 6]

// Crossover / event factions that can be hidden from the roster
export const COLLAB = new Set(['Bilibili', 'Neptunia', 'SSSS', 'The Idolmaster', 'Venus Vacation', 'Hololive', 'Utawarerumono', 'Atelier Ryza', 'Kizuna AI'])

// Accent used to tint the page background when a faction is selected
export const FACTION_COLOR = {
  'Sakura Empire': '#f472b6', 'Eagle Union': '#38bdf8', 'Royal Navy': '#818cf8', 'Iron Blood': '#ef4444',
  'Sardegna Empire': '#fbbf24', 'Northern Parliament': '#fb7185', 'Dragon Empery': '#f97316',
  'Vichya Dominion': '#a78bfa', 'Iris Libre': '#e879f9', META: '#22d3ee'
}

// Raw GitHub first, jsDelivr as automatic fallback when an image fails to load.
export const IMG_BASES = [
  'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/',
  'https://cdn.jsdelivr.net/gh/AzurAPI/azurapi-js-setup@master/images/'
]
export const imgUrls = (p) => (p ? IMG_BASES.map((b) => b + p) : [])

const HULL_ORDER = ['Destroyer', 'Light Cruiser', 'Heavy Cruiser', 'Large Cruiser', 'Battlecruiser', 'Battleship', 'Light Carrier', 'Aircraft Carrier', 'Submarine', 'Submarine Carrier', 'Monitor', 'Repair', 'Munition Ship', 'Sailing Frigate']

function build(raw) {
  const ships = raw.map((s) => ({
    ...s,
    th: imgUrls(s.img),
    artU: imgUrls(s.art),
    rk: RANK[s.r] ?? 0,
    collab: COLLAB.has(s.nat),
    nameN: norm(s.n.en + ' ' + s.n.code),
    hay: norm([s.n.en, s.n.cn, s.n.jp, s.n.kr, s.n.code, s.cls, s.id, s.nat, s.hull].join(' '))
  }))
  // Different ships that share a name (Enterprise, Kasumi, Neptune): the UI appends the faction to tell them apart
  const seen = {}
  for (const s of ships) seen[s.n.en] = (seen[s.n.en] || 0) + 1
  for (const s of ships) s.dup = seen[s.n.en] > 1
  const nations = [...new Set(ships.map((s) => s.nat))].filter(Boolean).sort((a, b) => a.localeCompare(b))
  const hulls = [...new Set(ships.map((s) => s.hull))].filter(Boolean)
    .sort((a, b) => ((HULL_ORDER.indexOf(a) + 99) % 99) - ((HULL_ORDER.indexOf(b) + 99) % 99) || a.localeCompare(b))

  // Per level tab (Lv.1 / 100 / 120): absolute max (bars) and 95th percentile (radar, robust to outliers)
  const STAT_MAX = [], STAT_REF = []
  for (let i = 0; i < 3; i++) {
    const cols = {}
    for (const s of ships) s.s[i]?.forEach((v, j) => { const n = parseFloat(v); if (!isNaN(n)) (cols[j] ||= []).push(n) })
    const mx = {}, rf = {}
    for (const j in cols) {
      const a = cols[j].sort((x, y) => x - y)
      mx[j] = a[a.length - 1]
      rf[j] = a[Math.floor(0.95 * (a.length - 1))] || mx[j]
    }
    STAT_MAX.push(mx); STAT_REF.push(rf)
  }
  return { ships, nations, hulls, STAT_MAX, STAT_REF }
}

let shipsP, extraP
/** Ship list is a separate chunk, loaded after the first paint. */
export const loadShips = () => (shipsP ||= import('../data/ships.json').then((m) => build(m.default)).catch((e) => { shipsP = null; throw e }))
/** Skills, skins, obtain info: only fetched when a detail dialog opens. */
export const loadExtra = () => (extraP ||= import('../data/extra.json').then((m) => m.default).catch((e) => { extraP = null; throw e }))

const Ctx = createContext(null)
export const DataProvider = Ctx.Provider
export const useData = () => useContext(Ctx)
