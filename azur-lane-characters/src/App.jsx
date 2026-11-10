import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import {
  Anchor, ArrowUp, Download, FileJson, FileSpreadsheet, Flag, Layers, LayoutGrid, List, Search, SearchX,
  Settings as Cog, Ship as ShipIcon, SlidersHorizontal, RotateCcw, X, ArrowUpDown
} from 'lucide-react'
import { RARITIES, RAR, hulls, nations, ships } from './lib/data.js'
import { applyTheme } from './lib/theme.js'
import { I18nProvider, useI18n } from './lib/i18n.jsx'
import { copyText, download, toCSV, toJSON } from './lib/export.js'
import { Btn, IconBtn, Modal, Segmented, Select, ToastProvider, cx, useToast } from './components/UI.jsx'
import { ShipCard } from './components/ShipCard.jsx'
import { Detail } from './components/Detail.jsx'
import { SettingsSheet } from './components/Settings.jsx'

const DEFAULTS = {
  theme: 'system', color: 'Light Blue', size: 'md', font: 'System', view: 'grid',
  lang: typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}
const PAGE = 48

function useSettings() {
  const [s, setS] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('al-settings') || '{}') } } catch { return DEFAULTS }
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
  return [s, set, reset]
}

const SORTS = {
  'rarity-desc': (a, b) => b.rk - a.rk || b.st - a.st || a.n.en.localeCompare(b.n.en),
  'rarity-asc': (a, b) => a.rk - b.rk || a.st - b.st || a.n.en.localeCompare(b.n.en),
  'name-asc': (a, b) => a.n.en.localeCompare(b.n.en),
  'name-desc': (a, b) => b.n.en.localeCompare(a.n.en),
  stars: (a, b) => b.st - a.st || a.n.en.localeCompare(b.n.en)
}

function Main({ st, set, reset }) {
  const { t, tv } = useI18n()
  const toast = useToast()
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const [rar, setRar] = useState([])
  const [nat, setNat] = useState('')
  const [hull, setHull] = useState('')
  const [sort, setSort] = useState('rarity-desc')
  const [fOpen, setFOpen] = useState(false)
  const [sOpen, setSOpen] = useState(false)
  const [eOpen, setEOpen] = useState(false)
  const [scope, setScope] = useState('filtered')
  const [sel, setSel] = useState(null)
  const [dOpen, setDOpen] = useState(false)
  const [limit, setLimit] = useState(PAGE)
  const [top, setTop] = useState(false)
  const sentinel = useRef(null)

  const list = useMemo(() => {
    const k = dq.trim().toLowerCase()
    return ships
      .filter((s) => (!k || s.hay.includes(k)) && (!rar.length || rar.includes(s.r)) && (!nat || s.nat === nat) && (!hull || s.hull === hull))
      .sort(SORTS[sort])
  }, [dq, rar, nat, hull, sort])

  const active = (rar.length ? 1 : 0) + (nat ? 1 : 0) + (hull ? 1 : 0) + (q ? 1 : 0)
  const clearAll = () => { setQ(''); setRar([]); setNat(''); setHull('') }

  useEffect(() => { setLimit(PAGE) }, [list])

  const more = list.length > limit
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setLimit((l) => l + PAGE) }, { rootMargin: '700px' })
    io.observe(el)
    return () => io.disconnect()
  }, [more, limit])

  useEffect(() => {
    const f = () => setTop(window.scrollY > 600)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  const open = useCallback((s) => { setSel(s); setDOpen(true) }, [])
  const copy = useCallback(async (s) => {
    const ok = await copyText(s.n.en)
    if (ok) toast.success(t('copiedOk', { name: s.n.en }))
    else toast.error(t('copyFail'))
    return ok
  }, [t, toast])

  const doExport = (fmt) => {
    const data = scope === 'all' ? ships : list
    if (!data.length) { toast.warning(t('exportEmpty')); return }
    const stamp = new Date().toISOString().slice(0, 10)
    if (fmt === 'csv') download(`azur-lane-ships-${stamp}.csv`, toCSV(data), 'text/csv;charset=utf-8')
    else download(`azur-lane-ships-${stamp}.json`, toJSON(data), 'application/json;charset=utf-8')
    setEOpen(false)
    toast.success(t('exportOk', { n: data.length, fmt: fmt.toUpperCase() }))
  }

  const toggleRar = (r) => setRar((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))
  const natOptions = [{ value: '', label: t('allFactions') }, ...nations.map((n) => ({ value: n, label: tv('nat', n) }))]
  const hullOptions = [{ value: '', label: t('allTypes') }, ...hulls.map((h) => ({ value: h, label: tv('hull', h) }))]
  const sortOptions = Object.keys(SORTS).map((k) => ({ value: k, label: t({ 'rarity-desc': 'sortRarityDesc', 'rarity-asc': 'sortRarityAsc', 'name-asc': 'sortNameAsc', 'name-desc': 'sortNameDesc', stars: 'sortStars' }[k]) }))
  const visible = list.slice(0, limit)

  return (
    <>
      <div className="scene" aria-hidden="true" />
      <div className="scene-hex" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-line bg-surf/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="hex grid h-9 w-9 shrink-0 place-items-center bg-primary text-onp"><Anchor className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-black uppercase tracking-wider">Azur <span className="text-ink">Lane</span></div>
              <div className="truncate text-[10px] font-semibold uppercase tracking-[.25em] text-muted">{t('brandSub')}</div>
            </div>
          </div>
          <IconBtn label={t('export')} icon={Download} onClick={() => setEOpen(true)} />
          <IconBtn label={t('settings')} icon={Cog} onClick={() => setSOpen(true)} />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-3 pb-24 pt-5 sm:px-5">
        <section className="hero rounded-md border border-line px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-ink">{t('heroTag')}</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wide sm:text-5xl">Azur <span className="text-ink">Lane</span></h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t('heroDesc')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill"><ShipIcon className="h-4 w-4 text-ink" aria-hidden="true" /><b>{ships.length}</b><span className="text-muted">{t('pillShips')}</span></span>
            <span className="pill"><Flag className="h-4 w-4 text-ink" aria-hidden="true" /><b>{nations.length}</b><span className="text-muted">{t('pillFactions')}</span></span>
            <span className="pill"><Layers className="h-4 w-4 text-ink" aria-hidden="true" /><b>{hulls.length}</b><span className="text-muted">{t('pillTypes')}</span></span>
          </div>
        </section>

        <section className="space-y-3" aria-label={t('filters')}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} aria-label={t('search')} />
              {q && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2">
                  <IconBtn label={t('clearSearch')} icon={X} onClick={() => setQ('')} className="!h-8 !w-8" />
                </span>
              )}
            </div>
            <button type="button" onClick={() => setFOpen((v) => !v)} aria-expanded={fOpen} className="btn border border-line bg-surf text-fg hover:bg-surf2 md:hidden">
              <SlidersHorizontal aria-hidden="true" /><span>{t('filters')}</span>
              {active > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] text-onp">{active}</span>}
            </button>
          </div>

          <div className={cx('space-y-3', fOpen ? 'block' : 'hidden md:block')}>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('rarity')}>
              {RARITIES.map((r) => {
                const c = RAR[r]
                return (
                  <button key={r} type="button" aria-pressed={rar.includes(r)} onClick={() => toggleRar(r)} className={cx('chip', rar.includes(r) && 'is-on')} style={{ '--rc': c.c, '--rg': c.g || c.c }}>
                    <i />{tv('rarity', r)}
                  </button>
                )
              })}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <Select label={t('nation')} icon={Flag} value={nat} onChange={setNat} options={natOptions} />
              <Select label={t('hull')} icon={Layers} value={hull} onChange={setHull} options={hullOptions} />
              <Select label={t('sort')} icon={ArrowUpDown} value={sort} onChange={setSort} options={sortOptions} />
              <Btn tone="neutral" icon={RotateCcw} onClick={clearAll} disabled={!active}>{t('resetFilters')}</Btn>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">{t('showing', { n: list.length, m: ships.length })}</p>
            <div className="w-28">
              <Segmented label="View" value={st.view} onChange={(v) => set('view', v)} options={[
                { value: 'grid', label: '', icon: LayoutGrid, tip: t('grid') }, { value: 'list', label: '', icon: List, tip: t('list') }
              ]} />
            </div>
          </div>
        </section>

        {list.length === 0 ? (
          <div className="anim-up grid place-items-center rounded-md border border-dashed border-line bg-surf/60 px-6 py-16 text-center">
            <SearchX className="h-12 w-12 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">{t('empty')}</h2>
            <p className="mt-1 text-sm text-muted">{t('emptyHint')}</p>
            <Btn className="mt-5" tone="primary" icon={RotateCcw} onClick={clearAll}>{t('resetFilters')}</Btn>
          </div>
        ) : (
          <div className={st.view === 'list' ? 'grid gap-2.5 lg:grid-cols-2' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}>
            {visible.map((s, i) => <ShipCard key={s.id} s={s} i={i} view={st.view} onOpen={open} onCopy={copy} />)}
          </div>
        )}
        {more && (
          <div ref={sentinel} className="flex justify-center py-4">
            <Btn tone="neutral" icon={ArrowUp} className="[&_svg]:rotate-180" onClick={() => setLimit((l) => l + PAGE)}>{t('loadMore')}</Btn>
          </div>
        )}
      </main>

      <div className={cx('fixed bottom-5 right-4 z-30 transition-all duration-300 sm:right-6', top ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <button type="button" aria-label={t('backTop')} tabIndex={top ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn !h-12 !w-12 !rounded-full bg-primary !p-0 text-onp shadow-lg shadow-primary/40 hover:brightness-110">
          <ArrowUp className="!h-5 !w-5" aria-hidden="true" />
        </button>
      </div>

      <Detail s={sel} open={dOpen} onClose={() => setDOpen(false)} onCopy={copy} />
      <SettingsSheet open={sOpen} onClose={() => setSOpen(false)} st={st} set={set} onReset={() => { reset(); toast.info(t('settingsReset')) }} />

      <Modal
        open={eOpen} onClose={() => setEOpen(false)} title={t('exportTitle')} icon={Download} size="sm"
        footer={<>
          <Btn tone="neutral" icon={X} onClick={() => setEOpen(false)}>{t('cancel')}</Btn>
          <Btn tone="success" icon={FileSpreadsheet} onClick={() => doExport('csv')}>{t('csv')}</Btn>
          <Btn tone="info" icon={FileJson} onClick={() => doExport('json')}>{t('json')}</Btn>
        </>}
      >
        <p className="mb-3 text-sm text-muted">{t('exportDesc')}</p>
        <Segmented label={t('exportTitle')} value={scope} onChange={setScope} options={[
          { value: 'filtered', label: t('scopeFiltered', { n: list.length }) }, { value: 'all', label: t('scopeAll', { n: ships.length }) }
        ]} />
      </Modal>
    </>
  )
}

export default function App() {
  const [st, set, reset] = useSettings()
  return (
    <I18nProvider lang={st.lang}>
      <ToastProvider>
        <Main st={st} set={set} reset={reset} />
      </ToastProvider>
    </I18nProvider>
  )
}
