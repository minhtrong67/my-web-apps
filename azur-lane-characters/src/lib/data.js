import raw from '../data/ships.json'

const BASE = 'https://raw.githubusercontent.com/AzurAPI/azurapi-js-setup/master/images/'

export const RARITIES = ['Normal', 'Rare', 'Elite', 'Super Rare', 'Ultra Rare', 'Priority', 'Decisive']
const RANK = { Normal: 0, Rare: 1, Elite: 2, 'Super Rare': 3, Priority: 3, 'Ultra Rare': 4, Decisive: 4 }
const RAINBOW = 'linear-gradient(90deg,#f472b6,#facc15,#34d399,#38bdf8,#a78bfa)'

export const RAR = {
  Normal: { c: '#9ca3af' },
  Rare: { c: '#38bdf8' },
  Elite: { c: '#c084fc' },
  'Super Rare': { c: '#facc15' },
  'Ultra Rare': { c: '#f472b6', g: RAINBOW },
  Priority: { c: '#fb923c', g: 'linear-gradient(90deg,#fb923c,#facc15)' },
  Decisive: { c: '#34d399', g: RAINBOW }
}

// Order of values inside each stats array
export const STAT_KEYS = ['health', 'armor', 'reload', 'luck', 'firepower', 'torpedo', 'evasion', 'speed', 'antiair', 'aviation', 'oil', 'accuracy', 'asw']
// Stats shown in the detail dialog (index into STAT_KEYS)
export const STAT_SHOW = [0, 4, 5, 9, 8, 2, 6, 11, 12, 7, 3, 10]

export const ships = raw.map((s) => ({
  ...s,
  thumb: BASE + s.img,
  artUrl: s.art ? BASE + s.art : '',
  rk: RANK[s.r] ?? 0,
  hay: [s.n.en, s.n.cn, s.n.jp, s.n.kr, s.n.code, s.cls, s.id].join(' ').toLowerCase()
}))

const HULL_ORDER = ['Destroyer', 'Light Cruiser', 'Heavy Cruiser', 'Large Cruiser', 'Battlecruiser', 'Battleship', 'Light Carrier', 'Aircraft Carrier', 'Submarine', 'Submarine Carrier', 'Monitor', 'Repair', 'Munition Ship', 'Sailing Frigate']
export const nations = [...new Set(ships.map((s) => s.nat))].filter(Boolean).sort((a, b) => a.localeCompare(b))
export const hulls = [...new Set(ships.map((s) => s.hull))].filter(Boolean)
  .sort((a, b) => (HULL_ORDER.indexOf(a) + 99) % 99 - (HULL_ORDER.indexOf(b) + 99) % 99 || a.localeCompare(b))

// Max value per stat and level tab, used to draw the stat bars.
export const STAT_MAX = [0, 1, 2].map((i) => {
  const m = {}
  for (const s of ships) {
    const a = s.s[i]
    if (!a) continue
    a.forEach((v, j) => { const n = parseFloat(v); if (!isNaN(n) && n > (m[j] || 0)) m[j] = n })
  }
  return m
})
