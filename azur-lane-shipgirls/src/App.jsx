import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, Anchor, ArrowUp, ArrowUpDown, BadgeCheck, CheckSquare, Copy, Download, FileJson, FileSpreadsheet, Flag, GitCompareArrows,
  Heart, Keyboard, Layers, LayoutGrid, List, Loader2, RefreshCw, RotateCcw, Search, SearchX, Settings as Cog, Ship as ShipIcon,
  SlidersHorizontal, X
} from 'lucide-react'
import { COLORS, FONTS, applyTheme } from './lib/theme.js'
import { DataProvider, FACTION_COLOR, RAR, RARITIES, loadShips, useData } from './lib/data.js'
import { LANGS, I18nProvider, useI18n } from './lib/i18n.jsx'
import { copyText, download, toCSV, toJSON } from './lib/export.js'
import { score, tokens } from './lib/search.js'
import { useCollection } from './lib/collection.js'
import { applyUpdate } from './lib/pwa.js'
import { Btn, IconBtn, Modal, Segmented, Select, ToastProvider, Tooltip, cx, modalOpen, useToast } from './components/UI.jsx'
import { MOD, Shortcuts } from './components/Shortcuts.jsx'
import { ShipCard } from './components/ShipCard.jsx'
import { Detail } from './components/Detail.jsx'
import { VirtualGrid } from './components/VirtualGrid.jsx'
import { Compare } from './components/Compare.jsx'
import { SettingsSheet } from './components/Settings.jsx'

const DEFAULTS = {
  theme: 'system', color: 'Light Blue', size: 'md', font: 'System', view: 'grid', density: 'comfy', nameLang: 'auto', collab: true,
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}
const CHECK = {
  theme: (v) => ['light', 'dark', 'system'].includes(v), color: (v) => v in COLORS, size: (v) => ['sm', 'md', 'lg'].includes(v),
  font: (v) => v in FONTS, view: (v) => ['grid', 'list'].includes(v), density: (v) => ['comfy', 'compact'].includes(v),
  nameLang: (v) => ['auto', 'en', 'jp', 'cn', 'kr'].includes(v), collab: (v) => typeof v === 'boolean', lang: (v) => LANGS.some((l) => l.value === v)
}
const clean = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => CHECK[k]?.(v)))

function useSettings() {
  const [s, setS] = useState(() => {
    try { return { ...DEFAULTS, ...clean(JSON.parse(localStorage.getItem('al-settings') || '{}')) } } catch { return DEFAULTS }
  })
  useEffect(() => {
    applyTheme(s)
    document.documentElement.lang = s.lang
    try { localStorage.setItem('al-settings', JSON.stringify(s)) } catch { /* storage unavailable */ }
  }, [s])
  useEffect(() => {
    if (s.theme !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const f = () => applyTheme(s)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [s])
  const set = useCallback((k, v) => setS((p) => ({ ...p, [k]: v })), [])
  const reset = useCallback(() => setS((p) => ({ ...DEFAULTS, view: p.view })), [])
  const setAll = useCallback((o) => setS((p) => ({ ...p, ...clean(o) })), [])
  return [s, set, reset, setAll]
}

const SORTS = {
  'rarity-desc': (a, b) => b.rk - a.rk || b.st - a.st || a.n.en.localeCompare(b.n.en),
  'rarity-asc': (a, b) => a.rk - b.rk || a.st - b.st || a.n.en.localeCompare(b.n.en),
  'name-asc': (a, b) => a.n.en.localeCompare(b.n.en),
  'name-desc': (a, b) => b.n.en.localeCompare(a.n.en),
  stars: (a, b) => b.st - a.st || a.n.en.localeCompare(b.n.en)
}
const SORT_KEY = { 'rarity-desc': 'sortRarityDesc', 'rarity-asc': 'sortRarityAsc', 'name-asc': 'sortNameAsc', 'name-desc': 'sortNameDesc', stars: 'sortStars' }
const GRID = {
  comfy: 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  compact: 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9'
}

function readUrl() {
  const p = new URLSearchParams(location.search)
  const sort = p.get('s'), show = p.get('show')
  return {
    q: p.get('q') || '', rar: (p.get('r') || '').split(',').filter((x) => RARITIES.includes(x)), nat: p.get('n') || '', hull: p.get('h') || '',
    sort: SORTS[sort] ? sort : 'rarity-desc', show: ['fav', 'owned', 'missing'].includes(show) ? show : '', ship: p.get('ship') || ''
  }
}

function Scene({ tint }) {
  const last = useRef(null)
  if (tint) last.current = tint
  return (
    <>
      <div className="scene" aria-hidden="true" />
      <div className="scene-tint" aria-hidden="true" style={{ opacity: tint ? 1 : 0, background: `radial-gradient(820px 520px at 12% 0%, ${last.current || 'transparent'}38, transparent 62%)` }} />
      <div className="scene-hex" aria-hidden="true" />
    </>
  )
}

function Splash({ err, onRetry }) {
  const { t } = useI18n()
  return (
    <>
      <Scene />
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="space-y-4">
          <span className="hex mx-auto grid h-16 w-16 animate-pulse place-items-center bg-primary text-onp">{err ? <AlertTriangle className="h-8 w-8" aria-hidden="true" /> : <Anchor className="h-8 w-8" aria-hidden="true" />}</span>
          {err ? (
            <>
              <p className="max-w-xs text-sm text-muted">{t('loadErr')}</p>
              <Btn tone="primary" icon={RefreshCw} onClick={onRetry}>{t('retry')}</Btn>
            </>
          ) : <p className="flex items-center justify-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('loading')}</p>}
        </div>
      </div>
    </>
  )
}

function Main({ st, set, reset, setAll }) {
  const { t, tv } = useI18n()
  const toast = useToast()
  const { ships: allShips } = useData()
  const col_ = useCollection()
  const init = useMemo(readUrl, [])
  const byId = useMemo(() => new Map(allShips.map((s) => [s.id, s])), [allShips])

  const [q, setQ] = useState(init.q)
  const dq = useDeferredValue(q)
  const [rar, setRar] = useState(init.rar)
  const [nat, setNat] = useState(init.nat)
  const [hull, setHull] = useState(init.hull)
  const [sort, setSort] = useState(init.sort)
  const [show, setShow] = useState(init.show)
  const [fOpen, setFOpen] = useState(false)
  const [sOpen, setSOpen] = useState(false)
  const [eOpen, setEOpen] = useState(false)
  const [hOpen, setHOpen] = useState(false)
  const [cOpen, setCOpen] = useState(false)
  const [scope, setScope] = useState('filtered')
  const [sel, setSel] = useState(() => byId.get(init.ship) || null)
  const [dOpen, setDOpen] = useState(() => !!byId.get(init.ship))
  const [selMode, setSelMode] = useState(false)
  const [picked, setPicked] = useState(() => new Set())
  const [top, setTop] = useState(false)
  const [mini, setMini] = useState(false)
  const [upd, setUpd] = useState(false)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)
  const firstRun = useRef(true)
  const miniRef = useRef(null)
  const wasOpen = useRef(dOpen)

  const nameKey = st.nameLang === 'auto' ? ({ ja: 'jp', zh: 'cn', ko: 'kr' }[st.lang] || 'en') : st.nameLang
  const nameOf = (s) => (s.n[nameKey] || s.n.en) + (s.dup ? ` (${tv('nat', s.nat)})` : '')
  const pool = useMemo(() => (st.collab ? allShips : allShips.filter((s) => !s.collab)), [allShips, st.collab])
  const nations = useMemo(() => [...new Set(pool.map((s) => s.nat))].filter(Boolean).sort((a, b) => a.localeCompare(b)), [pool])
  const hulls = useMemo(() => [...new Set(pool.map((s) => s.hull))].filter(Boolean), [pool])
  const hullsSorted = useMemo(() => [...hulls].sort((a, b) => allShips.findIndex((s) => s.hull === a) - allShips.findIndex((s) => s.hull === b)), [hulls, allShips])
  const toks = useMemo(() => tokens(dq), [dq])

  const dep = show ? [col_.fav, col_.own] : [0, 0]
  const list = useMemo(() => {
    const a = []
    for (const s of pool) {
      if (rar.length && !rar.includes(s.r)) continue
      if (nat && s.nat !== nat) continue
      if (hull && s.hull !== hull) continue
      if (show === 'fav' && !col_.fav.has(s.id)) continue
      if (show === 'owned' && !col_.own.has(s.id)) continue
      if (show === 'missing' && col_.own.has(s.id)) continue
      const sc = score(s, toks)
      if (sc >= 0) a.push([s, sc])
    }
    const cmp = SORTS[sort]
    return a.sort((x, y) => (toks.length ? y[1] - x[1] : 0) || cmp(x[0], y[0])).map((x) => x[0])
  }, [pool, toks, rar, nat, hull, sort, show, ...dep]) // eslint-disable-line react-hooks/exhaustive-deps

  const ownedCount = useMemo(() => pool.reduce((n, s) => n + (col_.own.has(s.id) ? 1 : 0), 0), [pool, col_.own])
  const active = (rar.length ? 1 : 0) + (nat ? 1 : 0) + (hull ? 1 : 0) + (show ? 1 : 0) + (q ? 1 : 0)
  const clearAll = () => { setQ(''); setRar([]); setNat(''); setHull(''); setShow('') }

  /* ----- URL <-> state (shareable links, Back button closes the dialog) ----- */
  useEffect(() => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (rar.length) p.set('r', rar.join(','))
    if (nat) p.set('n', nat)
    if (hull) p.set('h', hull)
    if (sort !== 'rarity-desc') p.set('s', sort)
    if (show) p.set('show', show)
    if (dOpen && sel) p.set('ship', sel.id)
    const url = location.pathname + (p.toString() ? '?' + p : '') + location.hash
    const was = wasOpen.current
    wasOpen.current = dOpen
    if (url === location.pathname + location.search + location.hash) return
    if (dOpen && !was) history.pushState({ d: 1 }, '', url)
    else history.replaceState(history.state, '', url)
  }, [q, rar, nat, hull, sort, show, dOpen, sel])

  useEffect(() => {
    const pop = () => {
      const u = readUrl()
      setQ(u.q); setRar(u.rar); setNat(u.nat); setHull(u.hull); setSort(u.sort); setShow(u.show)
      const s = byId.get(u.ship)
      if (s) { setSel(s); setDOpen(true) } else setDOpen(false)
    }
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [byId])

  const closeDetail = useCallback(() => { if (history.state?.d) history.back(); else setDOpen(false) }, [])

  /* ----- keep results in view when the filters change while scrolled far down ----- */
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    const el = resultsRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [dq, rar, nat, hull, sort, show])

  /* ----- scroll state ----- */
  useEffect(() => {
    const f = () => { setTop(window.scrollY > 600); setMini(window.scrollY > 380) }
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  /* ----- PWA + connectivity ----- */
  useEffect(() => {
    const onPwa = (e) => { if (e.detail === 'update') setUpd(true); else if (e.detail === 'offline-ready') toast.info(t('offlineReady')) }
    const off = () => toast.warning(t('offline'))
    const on = () => toast.success(t('online'))
    window.addEventListener('al-pwa', onPwa); window.addEventListener('offline', off); window.addEventListener('online', on)
    return () => { window.removeEventListener('al-pwa', onPwa); window.removeEventListener('offline', off); window.removeEventListener('online', on) }
  }, [t, toast])

  /* ----- selection ----- */
  const toggleSel = useCallback((s) => setPicked((p) => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n }), [])
  const pickedShips = useMemo(() => [...picked].map((id) => byId.get(id)).filter(Boolean), [picked, byId])
  const exitSelect = useCallback(() => { setSelMode(false); setPicked(new Set()) }, [])

  /* ----- actions ----- */
  const open = useCallback((s) => { setSel(s); setDOpen(true) }, [])
  const copy = useCallback(async (s, key) => {
    const text = s.n[key || nameKey] || s.n.en
    const ok = await copyText(text)
    if (ok) toast.success(t('copiedOk', { name: text }))
    else toast.error(t('copyFail'))
    return ok
  }, [t, toast, nameKey])
  const onFav = useCallback((s) => col_.toggle('fav', s.id), [col_.toggle]) // eslint-disable-line react-hooks/exhaustive-deps
  const onOwn = useCallback((s) => col_.toggle('own', s.id), [col_.toggle]) // eslint-disable-line react-hooks/exhaustive-deps

  const copyPicked = async () => {
    const ok = await copyText(pickedShips.map((s) => s.n[nameKey] || s.n.en).join('\n'))
    if (ok) toast.success(t('copiedMany', { n: pickedShips.length })); else toast.error(t('copyFail'))
  }
  const bulk = (kind) => { const ids = pickedShips.map((s) => s.id); col_.bulk(kind, ids, !ids.every((id) => col_[kind].has(id))) }
  const openExport = (sc) => { setScope(sc); setEOpen(true) }
  const doExport = (fmt) => {
    const data = scope === 'all' ? pool : scope === 'selected' ? pickedShips : list
    if (!data.length) { toast.warning(t('exportEmpty')); return }
    const stamp = new Date().toISOString().slice(0, 10)
    if (fmt === 'csv') download(`azur-lane-shipgirls-${stamp}.csv`, toCSV(data, col_), 'text/csv;charset=utf-8')
    else download(`azur-lane-shipgirls-${stamp}.json`, toJSON(data, col_), 'application/json;charset=utf-8')
    setEOpen(false)
    toast.success(t('exportOk', { n: data.length, fmt: fmt.toUpperCase() }))
  }
  const getBackup = () => ({ app: 'azur-lane-shipgirls', version: 1, settings: st, favorites: [...col_.fav], owned: [...col_.own] })
  const onImport = (j) => {
    if (!j || !['azur-lane-shipgirls', 'azur-lane-roster'].includes(j.app)) { toast.error(t('importErr')); return }
    setAll(j.settings)
    col_.replace({ fav: Array.isArray(j.favorites) ? j.favorites : [], own: Array.isArray(j.owned) ? j.owned : [] })
    toast.success(t('importOk'))
  }

  /* ----- keyboard shortcuts ----- */
  useEffect(() => {
    const focusSearch = () => {
      const el = window.scrollY > 380 && miniRef.current ? miniRef.current : searchRef.current
      if (el === searchRef.current) window.scrollTo({ top: 0, behavior: 'smooth' })
      el?.focus(); el?.select()
    }
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (!modalOpen()) focusSearch(); return }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return
      if (e.key === '?') { e.preventDefault(); setHOpen((v) => !v); return }
      if (modalOpen()) return
      const key = e.key.toLowerCase()
      if (key === '/') { e.preventDefault(); focusSearch() }
      else if (key === 'g') set('view', st.view === 'grid' ? 'list' : 'grid')
      else if (key === 'e') openExport(picked.size ? 'selected' : 'filtered')
      else if (key === ',') setSOpen(true)
      else if (key === 't') set('theme', { light: 'dark', dark: 'system', system: 'light' }[st.theme])
      else if (key === 's') (selMode ? exitSelect() : setSelMode(true))
      else if (key === 'escape' && selMode) exitSelect()
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [st.view, st.theme, set, selMode, picked, exitSelect]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ----- derived UI ----- */
  const idx = sel ? list.findIndex((x) => x.id === sel.id) : -1
  const onPrev = idx > 0 ? () => setSel(list[idx - 1]) : null
  const onNext = idx >= 0 && idx < list.length - 1 ? () => setSel(list[idx + 1]) : null
  const natOptions = [{ value: '', label: t('allFactions') }, ...nations.map((n) => ({ value: n, label: tv('nat', n) }))]
  const hullOptions = [{ value: '', label: t('allTypes') }, ...hullsSorted.map((h) => ({ value: h, label: tv('hull', h) }))]
  const sortOptions = Object.keys(SORTS).map((k) => ({ value: k, label: t(SORT_KEY[k]) }))
  const showOptions = [{ value: '', label: t('showAll') }, { value: 'fav', label: t('showFav') }, { value: 'owned', label: t('showOwned') }, { value: 'missing', label: t('showMissing') }]
  const toggleRar = (r) => setRar((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))
  const pct = pool.length ? Math.round((ownedCount / pool.length) * 100) : 0
  const canCompare = picked.size >= 2 && picked.size <= 3

  const rarityChips = (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('rarity')}>
      {RARITIES.map((r) => {
        const c = RAR[r]
        return <button key={r} type="button" aria-pressed={rar.includes(r)} onClick={() => toggleRar(r)} className={cx('chip', rar.includes(r) && 'is-on')} style={{ '--rc': c.c, '--rg': c.g || c.c }}><i />{tv('rarity', r)}</button>
      })}
    </div>
  )
  const selects = (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Select label={t('nation')} icon={Flag} value={nat} onChange={setNat} options={natOptions} />
      <Select label={t('hull')} icon={Layers} value={hull} onChange={setHull} options={hullOptions} />
      <Select label={t('show')} icon={BadgeCheck} value={show} onChange={setShow} options={showOptions} />
      <Select label={t('sort')} icon={ArrowUpDown} value={sort} onChange={setSort} options={sortOptions} />
    </div>
  )

  return (
    <>
      <Scene tint={FACTION_COLOR[nat]} />

      <header className="sticky top-0 z-40 border-b border-line bg-surf/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="hex grid h-9 w-9 shrink-0 place-items-center bg-primary text-onp"><Anchor className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-black uppercase tracking-wider">Azur <span className="text-ink">Lane</span></div>
              <div className="truncate text-[10px] font-semibold uppercase tracking-[.3em] text-muted">Shipgirls</div>
            </div>
          </div>
          {mini && (
            <div className="anim-fade relative hidden w-56 sm:block lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input ref={miniRef} className="input !py-1.5" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')}
                onKeyDown={(e) => { if (e.key === 'Escape') { if (q) setQ(''); else e.currentTarget.blur() } else if (e.key === 'Enter') e.currentTarget.blur() }} />
            </div>
          )}
          <div className="hidden sm:block"><IconBtn label={`${t('shortcuts')} (?)`} icon={Keyboard} onClick={() => setHOpen(true)} /></div>
          <IconBtn label={`${t('export')} (E)`} icon={Download} onClick={() => openExport(picked.size ? 'selected' : 'filtered')} />
          <IconBtn label={`${t('settings')} (,)`} icon={Cog} onClick={() => setSOpen(true)} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-3 pb-28 pt-5 sm:px-5">
        <section className="hero rounded-md border border-line px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-ink">{t('heroTag')}</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wide sm:text-5xl">Azur Lane <span className="text-ink">Shipgirls</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t('heroDesc')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill"><ShipIcon className="h-4 w-4 text-ink" aria-hidden="true" /><b>{pool.length}</b><span className="text-muted">{t('pillShips')}</span></span>
            <span className="pill"><Flag className="h-4 w-4 text-ink" aria-hidden="true" /><b>{nations.length}</b><span className="text-muted">{t('pillFactions')}</span></span>
            <span className="pill"><Layers className="h-4 w-4 text-ink" aria-hidden="true" /><b>{hulls.length}</b><span className="text-muted">{t('pillTypes')}</span></span>
            {ownedCount > 0 && (
              <span className="pill anim-fade"><BadgeCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" /><b>{t('ownedProgress', { n: ownedCount, m: pool.length })}</b>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span className="block h-full rounded-full bg-emerald-500 transition-[width] duration-700" style={{ width: `${pct}%` }} /></span>
              </span>
            )}
          </div>
        </section>

        <section className="space-y-3" aria-label={t('filters')}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchRef} className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')}
                onKeyDown={(e) => { if (e.key === 'Escape') { if (q) setQ(''); else e.currentTarget.blur() } else if (e.key === 'Enter') e.currentTarget.blur() }}
              />
              {!q && <kbd className="kbd pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:inline-flex">{MOD} K</kbd>}
              {q && <span className="absolute right-1 top-1/2 -translate-y-1/2"><IconBtn label={t('clearSearch')} icon={X} onClick={() => setQ('')} className="!h-8 !w-8" /></span>}
            </div>
            <button type="button" onClick={() => setFOpen(true)} className="btn border border-line bg-surf text-fg hover:bg-surf2 md:hidden">
              <SlidersHorizontal aria-hidden="true" /><span>{t('filters')}</span>
              {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-onp">{active}</span>}
            </button>
          </div>

          <div className="hidden space-y-3 md:block">{rarityChips}{selects}</div>

          {(nat || hull || show) && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label={t('filters')}>
              {nat && <button type="button" className="chip is-on" style={{ '--rc': 'rgb(var(--p))' }} onClick={() => setNat('')}>{tv('nat', nat)}<X className="h-3 w-3" aria-hidden="true" /></button>}
              {hull && <button type="button" className="chip is-on" style={{ '--rc': 'rgb(var(--p))' }} onClick={() => setHull('')}>{tv('hull', hull)}<X className="h-3 w-3" aria-hidden="true" /></button>}
              {show && <button type="button" className="chip is-on" style={{ '--rc': 'rgb(var(--p))' }} onClick={() => setShow('')}>{showOptions.find((o) => o.value === show)?.label}<X className="h-3 w-3" aria-hidden="true" /></button>}
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-ink hover:underline"><RotateCcw className="h-3 w-3" aria-hidden="true" />{t('resetFilters')}</button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">{t('showing', { n: list.length, m: pool.length })}</p>
            <div className="flex items-center gap-2">
              <Tooltip label={`${selMode ? t('selectOff') : t('select')} (S)`}>
                <button type="button" aria-pressed={selMode} onClick={() => (selMode ? exitSelect() : setSelMode(true))} className={cx('btn !px-3 !py-1.5', selMode ? 'bg-primary text-onp' : 'border border-line bg-surf text-fg hover:bg-surf2')}>
                  <CheckSquare aria-hidden="true" /><span className="hidden sm:inline">{t('select')}</span>
                </button>
              </Tooltip>
              <div className="w-24">
                <Segmented label="View" value={st.view} onChange={(v) => set('view', v)} options={[
                  { value: 'grid', label: '', icon: LayoutGrid, tip: `${t('grid')} (G)` }, { value: 'list', label: '', icon: List, tip: `${t('list')} (G)` }
                ]} />
              </div>
            </div>
          </div>
        </section>

        <div ref={resultsRef}>{list.length === 0 ? (
          <div className="anim-up grid place-items-center rounded-md border border-dashed border-line bg-surf/60 px-6 py-16 text-center">
            <SearchX className="h-12 w-12 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">{t('empty')}</h2>
            <p className="mt-1 text-sm text-muted">{t('emptyHint')}</p>
            <Btn className="mt-5" tone="primary" icon={RotateCcw} onClick={clearAll}>{t('resetFilters')}</Btn>
          </div>
        ) : (
          <VirtualGrid
            key={`${st.view}-${st.density}`} measureKey={selMode} items={list} estimate={st.view === 'list' ? 120 : 330}
            className={st.view === 'list' ? 'grid gap-2.5 lg:grid-cols-2' : GRID[st.density]}
            render={(s, i, col) => (
              <ShipCard key={s.id} s={s} i={col} view={st.view} name={nameOf(s)} hl={toks} fav={col_.fav.has(s.id)} own={col_.own.has(s.id)}
                selMode={selMode} selected={picked.has(s.id)} onOpen={selMode ? toggleSel : open} onCopy={copy} onFav={onFav} onOwn={onOwn} />
            )}
          />
        )}</div>
      </main>

      {selMode && (
        <div className="anim-fade fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-3xl flex-wrap items-center gap-2 rounded-lg border border-line bg-surf/95 p-2.5 shadow-2xl backdrop-blur" role="toolbar" aria-label={t('selectHint')}>
          <span className="px-2 text-sm font-bold">{picked.size > 0 ? t('selected', { n: picked.size }) : t('selectHint')}</span>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Tooltip label={t('cmpLimit')}><span><Btn tone="primary" icon={GitCompareArrows} disabled={!canCompare} onClick={() => setCOpen(true)} className="max-sm:[&>span]:hidden">{t('compare')}</Btn></span></Tooltip>
            <Btn tone="info" icon={Copy} disabled={!picked.size} onClick={copyPicked} className="max-sm:[&>span]:hidden">{t('copyNames')}</Btn>
            <Btn tone="success" icon={BadgeCheck} disabled={!picked.size} onClick={() => bulk('own')} className="max-sm:[&>span]:hidden">{t('bulkOwn')}</Btn>
            <Btn tone="danger" icon={Heart} disabled={!picked.size} onClick={() => bulk('fav')} className="max-sm:[&>span]:hidden">{t('bulkFav')}</Btn>
            <Btn tone="info" icon={Download} disabled={!picked.size} onClick={() => openExport('selected')} className="max-sm:[&>span]:hidden">{t('export')}</Btn>
            <Btn tone="neutral" icon={X} onClick={exitSelect} className="max-sm:[&>span]:hidden">{t('done')}</Btn>
          </div>
        </div>
      )}

      {upd && (
        <div className="anim-toast fixed bottom-3 left-3 z-[60] flex max-w-sm items-center gap-3 rounded-lg border border-primary/50 bg-surf p-3 shadow-2xl" role="status">
          <RefreshCw className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm font-medium">{t('updateReady')}</p>
          <Btn tone="primary" icon={RefreshCw} className="!px-3 !py-1.5" onClick={applyUpdate}>{t('refresh')}</Btn>
          <Btn tone="neutral" icon={X} className="!px-3 !py-1.5" onClick={() => setUpd(false)}>{t('later')}</Btn>
        </div>
      )}

      <div className={cx('fixed right-4 z-30 transition-all duration-300 sm:right-6', selMode ? 'bottom-24' : 'bottom-5', top ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <Tooltip label={t('backTop')}>
          <button type="button" aria-label={t('backTop')} tabIndex={top ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn !h-12 !w-12 !rounded-full bg-primary !p-0 text-onp shadow-lg shadow-primary/40 hover:brightness-110">
            <ArrowUp className="!h-5 !w-5" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>

      <Detail s={sel} open={dOpen} onClose={closeDetail} onCopy={copy} onPrev={onPrev} onNext={onNext} pos={idx + 1} total={list.length}
        fav={!!sel && col_.fav.has(sel.id)} own={!!sel && col_.own.has(sel.id)} onFav={onFav} onOwn={onOwn} nameKey={nameKey} />
      <Compare open={cOpen} onClose={() => setCOpen(false)} ships={cOpen ? pickedShips.slice(0, 3) : []} nameKey={nameKey} />
      <Shortcuts open={hOpen} onClose={() => setHOpen(false)} />
      <SettingsSheet open={sOpen} onClose={() => setSOpen(false)} st={st} set={set} getBackup={getBackup} onImport={onImport} onReset={() => { reset(); toast.info(t('settingsReset')) }} />

      <Modal variant="bottom" open={fOpen} onClose={() => setFOpen(false)} title={t('filters')} icon={SlidersHorizontal}
        footer={<>
          <Btn tone="neutral" icon={RotateCcw} onClick={clearAll} disabled={!active}>{t('resetFilters')}</Btn>
          <Btn tone="primary" icon={ShipIcon} onClick={() => setFOpen(false)}>{t('showing', { n: list.length, m: pool.length })}</Btn>
        </>}>
        <div className="space-y-4">{rarityChips}<div className="grid gap-2">{selects}</div></div>
      </Modal>

      <Modal open={eOpen} onClose={() => setEOpen(false)} title={t('exportTitle')} icon={Download} size="sm"
        footer={<>
          <Btn tone="neutral" icon={X} onClick={() => setEOpen(false)}>{t('cancel')}</Btn>
          <Btn tone="success" icon={FileSpreadsheet} onClick={() => doExport('csv')}>{t('csv')}</Btn>
          <Btn tone="info" icon={FileJson} onClick={() => doExport('json')}>{t('json')}</Btn>
        </>}>
        <p className="mb-3 text-sm text-muted">{t('exportDesc')}</p>
        <Segmented label={t('exportTitle')} value={scope} onChange={setScope} options={[
          { value: 'filtered', label: t('scopeFiltered', { n: list.length }) }, { value: 'all', label: t('scopeAll', { n: pool.length }) },
          ...(picked.size ? [{ value: 'selected', label: t('scopeSelected', { n: picked.size }) }] : [])
        ]} />
      </Modal>
    </>
  )
}

export default function App() {
  const [st, set, reset, setAll] = useSettings()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(false)
  const load = useCallback(() => { setErr(false); loadShips().then(setData).catch(() => setErr(true)) }, [])
  useEffect(load, [load])
  return (
    <I18nProvider lang={st.lang}>
      <ToastProvider>
        {data ? <DataProvider value={data}><Main st={st} set={set} reset={reset} setAll={setAll} /></DataProvider> : <Splash err={err} onRetry={load} />}
      </ToastProvider>
    </I18nProvider>
  )
}
