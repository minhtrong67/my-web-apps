import { useCallback, useEffect, useState } from 'react'

const KEY = 'al-collection'
const read = () => {
  try { const j = JSON.parse(localStorage.getItem(KEY) || '{}'); return { fav: new Set(j.fav || []), own: new Set(j.own || []) } }
  catch { return { fav: new Set(), own: new Set() } }
}

/** Favorites and "owned" ships, persisted in localStorage. */
export function useCollection() {
  const [c, setC] = useState(read)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ fav: [...c.fav], own: [...c.own] })) } catch { /* ignore */ } }, [c])
  const toggle = useCallback((kind, id) => setC((p) => { const n = new Set(p[kind]); n.has(id) ? n.delete(id) : n.add(id); return { ...p, [kind]: n } }), [])
  const bulk = useCallback((kind, ids, on) => setC((p) => { const n = new Set(p[kind]); ids.forEach((i) => (on ? n.add(i) : n.delete(i))); return { ...p, [kind]: n } }), [])
  const replace = useCallback((j) => setC({ fav: new Set(j.fav || []), own: new Set(j.own || []) }), [])
  return { fav: c.fav, own: c.own, toggle, bulk, replace }
}
