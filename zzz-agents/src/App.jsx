import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { ELEMENTS, SPECIALTIES, ATTACKS, snapshot, cached, fetchAgents, factions, subscribeFactions, loadFactions } from './data.js'
import { useSettings } from './settings.jsx'
import AgentCard from './components/AgentCard.jsx'
import AgentDialog from './components/AgentDialog.jsx'
import CompareDialog from './components/CompareDialog.jsx'
import { CardSkeleton } from './components/Skeleton.jsx'
import Settings from './components/Settings.jsx'
import Select from './components/Select.jsx'
import { Btn, IconBtn } from './components/Btn.jsx'
import { useToast } from './components/Toast.jsx'
import Ic from './icons.jsx'

const EMPTY = { q: '', rarity: [], element: [], specialty: [], attack: [], faction: 'all' }

// Trạng thái <-> URL hash để chia sẻ link / dùng nút Back
const parseHash = () => {
  const p = new URLSearchParams(location.hash.slice(1))
  const arr = (k) => (p.get(k) ? p.get(k).split(',') : [])
  return {
    f: { q: p.get('q') || '', rarity: arr('r'), element: arr('e'), specialty: arr('s'), attack: arr('a'), faction: p.get('fac') || 'all' },
    sort: p.get('sort') || 'rarity', fav: p.get('fav') === '1', agent: +p.get('agent') || null
  }
}
const buildUrl = (f, sort, fav, agent) => {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  ;[['r', 'rarity'], ['e', 'element'], ['s', 'specialty'], ['a', 'attack']].forEach(([k, n]) => f[n].length && p.set(k, f[n].join(',')))
  if (f.faction !== 'all') p.set('fac', f.faction)
  if (sort !== 'rarity') p.set('sort', sort)
  if (fav) p.set('fav', '1')
  if (agent) p.set('agent', agent)
  const s = p.toString()
  return location.pathname + location.search + (s ? `#${s}` : '')
}

const Chip = ({ on, onClick, children, color }) => (
  <button onClick={onClick} aria-pressed={on} style={on && color ? { background: color, color: '#000', borderColor: color } : undefined}
    className={`btn cut-sm border px-3 py-1.5 text-sm font-bold transition-colors ${on ? (color ? '' : 'border-p bg-p text-onp') : 'border-line bg-surface hover:border-p'}`}>{children}</button>
)
const Group = ({ title, children }) => (
  <div><div className="mb-1.5 font-mono text-xs uppercase tracking-widest text-pt">{title}</div><div className="flex flex-wrap gap-1.5">{children}</div></div>
)

export default function App() {
  const { t, view, set } = useSettings()
  const toast = useToast()
  const init = useRef(parseHash())
  const pending = useRef(init.current.agent)
  const [agents, setAgents] = useState(() => cached())
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState(init.current.f)
  const [sort, setSort] = useState(init.current.sort)
  const [favOnly, setFavOnly] = useState(init.current.fav)
  const [showF, setShowF] = useState(false)
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState(null)
  const [top, setTop] = useState(false)
  const [favs, setFavs] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem('zzz-fav') || '[]')) } catch { return new Set() } })
  const [cmp, setCmp] = useState([])
  const [showCmp, setShowCmp] = useState(false)
  const [update, setUpdate] = useState(false)
  const [installEv, setInstallEv] = useState(null)
  const [facBusy, setFacBusy] = useState(false)
  const [facVer, tick] = useState(0)
  const searchRef = useRef(null)
  const updateRef = useRef(null)
  const mac = /Mac|iPhone|iPad/.test(navigator.platform)
  const dq = useDeferredValue(f.q)

  // ---- dữ liệu ----
  const load = useCallback(async (manual) => {
    setBusy(true)
    try {
      const d = await fetchAgents()
      setAgents(d)
      if (manual) toast('success', t('refreshed').replace('{n}', d.length))
    } catch {
      setAgents((a) => a || snapshot) // chưa có cache -> dùng danh sách dự phòng
      toast(manual ? 'error' : 'warning', manual ? t('refreshFail') : t('offline'))
    } finally { setBusy(false) }
  }, [t, toast])
  useEffect(() => { load(false) }, []) // eslint-disable-line
  useEffect(() => subscribeFactions(() => tick((n) => n + 1)), [])

  // ---- PWA: cập nhật + cài đặt ----
  useEffect(() => {
    updateRef.current = registerSW({ onNeedRefresh: () => setUpdate(true), onOfflineReady: () => toast('info', t('offlineReady')) })
    const h = (e) => { e.preventDefault(); setInstallEv(e) }
    const done = () => setInstallEv(null)
    addEventListener('beforeinstallprompt', h); addEventListener('appinstalled', done)
    return () => { removeEventListener('beforeinstallprompt', h); removeEventListener('appinstalled', done) }
  }, []) // eslint-disable-line
  const install = async () => { installEv.prompt(); await installEv.userChoice; setInstallEv(null) }

  // ---- URL / history ----
  const agentsRef = useRef(agents)
  agentsRef.current = agents
  useEffect(() => {
    if (pending.current && agents) {
      const a = agents.find((x) => x.id === pending.current)
      pending.current = null
      if (a) setSel(a)
    }
  }, [agents])
  useEffect(() => { history.replaceState(history.state, '', buildUrl(f, sort, favOnly, sel?.id)) }, [f, sort, favOnly, sel])
  useEffect(() => {
    const pop = () => {
      const id = +new URLSearchParams(location.hash.slice(1)).get('agent') || null
      setSel(id ? agentsRef.current?.find((x) => x.id === id) || null : null)
      setOpen(history.state?.layer === 'settings')
      setShowCmp(history.state?.layer === 'compare')
    }
    addEventListener('popstate', pop)
    return () => removeEventListener('popstate', pop)
  }, [])
  // Mỗi lớp phủ (chi tiết / cài đặt / so sánh) thêm 1 mục lịch sử -> nút Back đóng đúng lớp đó
  const pushLayer = useCallback((layer, agent) => history.pushState({ layer }, '', buildUrl(f, sort, favOnly, agent)), [f, sort, favOnly])
  const closeLayer = (layer, off) => () => (history.state?.layer === layer ? history.back() : off(false))
  const openAgent = useCallback((a) => { setSel(a); pushLayer('agent', a.id) }, [pushLayer])
  const closeAgent = useCallback(() => (history.state?.layer === 'agent' ? history.back() : setSel(null)), [])
  const openSettings = useCallback(() => { setOpen(true); pushLayer('settings') }, [pushLayer])
  const closeSettings = useCallback(closeLayer('settings', setOpen), [])
  const openCmp = useCallback(() => { setShowCmp(true); pushLayer('compare') }, [pushLayer])
  const closeCmp = useCallback(closeLayer('compare', setShowCmp), [])

  // ---- hành động ----
  const copy = useCallback(async (a) => {
    try { await navigator.clipboard.writeText(a.name); toast('success', t('copied').replace('{n}', a.name)) }
    catch { toast('error', t('copyFail')) }
  }, [t, toast])
  const toggleFav = useCallback((id) => setFavs((p) => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id)
    localStorage.setItem('zzz-fav', JSON.stringify([...n]))
    return n
  }), [])
  const toggleCmp = useCallback((id) => setCmp((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p.slice(-1), id])), [])
  const toggle = (k, v) => setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }))
  const resetFilters = () => { setF(EMPTY); setFavOnly(false) }
  const loadFac = async () => {
    setFacBusy(true)
    await loadFactions((agents || []).map((a) => a.id))
    setFacBusy(false)
    const all = (agents || []).every((a) => factions[a.id])
    toast(all ? 'success' : 'warning', t(all ? 'facDone' : 'facPartial'))
  }

  // ---- lọc / sắp xếp ----
  const list = useMemo(() => {
    const q = dq.trim().toLowerCase()
    return (agents || [])
      .filter((a) => (!q || Object.values(a.names || {}).concat(a.name).some((n) => n?.toLowerCase().includes(q)))
        && (!f.rarity.length || f.rarity.includes(a.rarity))
        && (!f.element.length || f.element.includes(a.element))
        && (!f.specialty.length || f.specialty.includes(a.specialty))
        && (!f.attack.length || f.attack.includes(a.attack))
        && (f.faction === 'all' || factions[a.id] === f.faction)
        && (!favOnly || favs.has(a.id)))
      .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name)
        : sort === 'element' ? a.element.localeCompare(b.element) || a.name.localeCompare(b.name)
        : b.rarity.localeCompare(a.rarity) || a.name.localeCompare(b.name))
  }, [agents, dq, f, sort, favOnly, favs, facVer])
  const idx = list.findIndex((x) => x.id === sel?.id)
  const step = useCallback((d) => {
    if (!list.length) return
    const b = idx < 0 ? (d > 0 ? -1 : 0) : idx
    setSel(list[(b + d + list.length) % list.length])
  }, [list, idx])
  const onPrev = useCallback(() => step(-1), [step])
  const onNext = useCallback(() => step(1), [step])
  const active = f.rarity.length + f.element.length + f.specialty.length + f.attack.length + !!f.q + (f.faction !== 'all') + favOnly
  const facList = [...new Set(Object.values(factions))].sort()
  const facKnown = (agents || []).filter((a) => factions[a.id]).length

  // ---- cuộn + phím tắt ----
  useEffect(() => {
    const on = () => setTop(scrollY > 500)
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); closeAgent(); closeSettings(); closeCmp()
        searchRef.current?.focus(); searchRef.current?.select(); return
      }
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.target.isContentEditable
      if (typing || e.ctrlKey || e.metaKey || e.altKey || sel || open || showCmp) return
      const key = e.key.toLowerCase()
      if (key === '/') { e.preventDefault(); searchRef.current?.focus() }
      else if (key === 'g') set({ view: view === 'grid' ? 'list' : 'grid' })
      else if (key === 'f') setShowF((s) => !s)
      else if (key === 's') openSettings()
      else if (key === 't') scrollTo({ top: 0, behavior: 'smooth' })
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [sel, open, showCmp, view, set, closeAgent, closeSettings, closeCmp, openSettings])

  const gridCls = view === 'grid' ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6' : 'flex flex-col gap-2'
  const cmpAgents = cmp.map((id) => agents?.find((a) => a.id === id)).filter(Boolean)

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24">
      <header className="sticky top-0 z-30 -mx-4 mb-4 border-b-2 border-p bg-bg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="cut-sm grid h-11 w-11 shrink-0 place-items-center bg-p text-xl font-black italic text-onp">Z</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black italic leading-none tracking-wide">{t('title')}</h1>
            <p className="truncate font-mono text-[11px] uppercase text-muted">{t('sub')}</p>
          </div>
          <div className="flex gap-1">
            <IconBtn icon="grid" label={`${t('grid')} (G)`} active={view === 'grid'} onClick={() => set({ view: 'grid' })} />
            <IconBtn icon="list" label={`${t('list')} (G)`} active={view === 'list'} onClick={() => set({ view: 'list' })} />
          </div>
          <IconBtn icon="gear" label={`${t('settings')} (S)`} onClick={openSettings} />
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="cut-sm flex h-11 min-w-0 basis-full items-center gap-2 border border-line bg-surface px-3 transition-colors focus-within:border-p sm:flex-1 sm:basis-0">
          <Ic n="search" />
          <input ref={searchRef} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder={t('search')} aria-keyshortcuts="Control+K"
            onKeyDown={(e) => { if (e.key === 'Escape') f.q ? setF({ ...f, q: '' }) : e.target.blur() }}
            className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-muted" />
          <kbd className="cut-sm hidden shrink-0 border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted md:block">{mac ? '⌘' : 'Ctrl'} K</kbd>
        </div>
        <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
          <Select label={t('sort')} value={sort} onChange={setSort}
            options={[{ value: 'rarity', label: `${t('sort')}: ${t('sortRarity')}` }, { value: 'name', label: `${t('sort')}: ${t('sortName')}` }, { value: 'element', label: `${t('sort')}: ${t('sortElement')}` }]} />
        </div>
        <button onClick={() => setShowF((s) => !s)} aria-expanded={showF}
          className={`btn cut-sm flex h-11 shrink-0 items-center gap-2 border px-4 font-bold transition-colors ${showF || active ? 'border-p bg-p text-onp' : 'border-line bg-surface hover:border-p'}`}>
          <Ic n="filter" />{t('filters')}{active > 0 && <span className="bg-bg px-1.5 font-mono text-xs text-fg">{active}</span>}
        </button>
      </div>

      {showF && (
        <div className="pop cut mb-4 space-y-4 border border-line bg-surface p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Group title={t('rarity')}>{['S', 'A'].map((r) => <Chip key={r} on={f.rarity.includes(r)} onClick={() => toggle('rarity', r)}>{r}</Chip>)}</Group>
            <Group title={t('attack')}>{ATTACKS.map((x) => <Chip key={x} on={f.attack.includes(x)} onClick={() => toggle('attack', x)}>{t(x)}</Chip>)}</Group>
          </div>
          <Group title={t('element')}>{Object.keys(ELEMENTS).map((e) => <Chip key={e} color={ELEMENTS[e]} on={f.element.includes(e)} onClick={() => toggle('element', e)}>{t(e)}</Chip>)}</Group>
          <Group title={t('specialty')}>{SPECIALTIES.map((s) => <Chip key={s} on={f.specialty.includes(s)} onClick={() => toggle('specialty', s)}>{t(s)}</Chip>)}</Group>
          <div className="grid items-end gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 font-mono text-xs uppercase tracking-widest text-pt">{t('faction')}</div>
              {facList.length > 0
                ? <Select label={t('faction')} value={f.faction} onChange={(v) => setF({ ...f, faction: v })} options={[{ value: 'all', label: t('all') }, ...facList.map((x) => ({ value: x, label: x }))]} />
                : <p className="text-xs text-muted">{t('facHint')}</p>}
            </div>
            {agents && facKnown < agents.length && (
              <div className="space-y-1">
                <Btn icon="download" variant="info" label={facBusy ? `${t('loading')} ${facKnown}/${agents.length}` : `${t('loadFactions')} (${facKnown}/${agents.length})`} onClick={facBusy ? undefined : loadFac} className="w-full" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip on={favOnly} onClick={() => setFavOnly((v) => !v)}>{t('favOnly')} ({favs.size})</Chip>
            <button onClick={resetFilters} className="font-mono text-sm uppercase text-pt underline">{t('reset')}</button>
          </div>
        </div>
      )}

      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted" aria-live="polite">{agents ? `${list.length} ${t('count')}` : '…'}{busy && agents && ' · …'}</p>
      {!agents
        ? <div className={gridCls} role="status" aria-label={t('loading')}>{Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} view={view} />)}</div>
        : list.length === 0
          ? <div className="flex flex-col items-center gap-4 py-20 text-center text-muted"><p>{t('empty')}</p><Btn icon="refresh" variant="primary" label={t('resetFilters')} onClick={resetFilters} /></div>
          : <div className={gridCls}>{list.map((a, i) => <AgentCard key={a.id} a={a} view={view} i={i} fav={favs.has(a.id)} onFav={toggleFav} onOpen={openAgent} onCopy={copy} />)}</div>}

      {top && (
        <div className="pop fixed bottom-5 right-5 z-30" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          <IconBtn icon="up" label={`${t('top')} (T)`} active className="shadow-xl !p-3" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} />
        </div>
      )}

      {cmpAgents.length > 0 && (
        <div className="pop cut fixed bottom-4 left-4 right-20 z-40 flex flex-wrap items-center gap-2 border-2 border-p bg-surface p-2 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          {cmpAgents.map((a) => <span key={a.id} className="cut-sm bg-p px-2 py-1 text-sm font-extrabold uppercase italic text-onp">{a.name}</span>)}
          {cmpAgents.length < 2 && <span className="text-xs text-muted">{t('compareHint')}</span>}
          {cmpAgents.length === 2 && <Btn icon="compare" variant="success" label={t('compareView')} onClick={openCmp} />}
          <Btn icon="close" variant="neutral" label={t('clear')} onClick={() => setCmp([])} />
        </div>
      )}

      {update && (
        <div className="pop cut fixed left-4 right-4 top-20 z-[80] flex flex-wrap items-center gap-3 border-2 border-p bg-surface p-3 shadow-2xl sm:left-auto sm:max-w-md" role="alert">
          <Ic n="info" className="h-5 w-5 text-pt" /><span className="flex-1 text-sm font-bold">{t('updateAvail')}</span>
          <Btn icon="refresh" variant="success" label={t('update')} onClick={() => updateRef.current?.(true)} />
          <Btn icon="close" variant="neutral" label={t('later')} onClick={() => setUpdate(false)} />
        </div>
      )}

      <AgentDialog a={sel} pos={idx + 1} total={list.length} neighbors={idx >= 0 ? [list[(idx - 1 + list.length) % list.length], list[(idx + 1) % list.length]] : []}
        onClose={closeAgent} onCopy={copy} onPrev={onPrev} onNext={onNext}
        fav={sel ? favs.has(sel.id) : false} onFav={toggleFav} inCmp={sel ? cmp.includes(sel.id) : false} onCmp={toggleCmp} />
      {showCmp && cmpAgents.length === 2 && <CompareDialog list={cmpAgents} onClose={closeCmp} />}
      <Settings open={open} onClose={closeSettings} onRefresh={() => load(true)} busy={busy} agents={agents || []} list={list} favs={favs} onInstall={installEv ? install : null} />
    </div>
  )
}
