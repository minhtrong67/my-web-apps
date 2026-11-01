import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, Heart, LayoutGrid, List, Search, SearchX, Settings, SlidersHorizontal, X } from 'lucide-react'
import DetailSheet from './components/DetailSheet.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ScrollTop from './components/ScrollTop.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import Sheet from './components/Sheet.jsx'
import { ListHeader, StudentCard, StudentRow } from './components/StudentViews.jsx'
import { IconButton, Segmented, Select, cx } from './components/ui.jsx'
import { readLS, useFavorites, useSettings, useToast, writeLS } from './lib/app-context.jsx'
import { GROUPS, SORTS, emptySel, filterStudents, suggest, valueLabel, GROUP_VALUES } from './lib/search.js'
import { BY_NAME, STUDENTS } from './lib/students.js'

const PAGE = 48
const BASE_TITLE = 'BA List – Danh sách học sinh Blue Archive, tìm kiếm & lọc nhanh'
const hashName = () => { try { return decodeURIComponent(location.hash.slice(1)) } catch { return '' } }

export default function App() {
  const { t, lang } = useSettings()
  const toast = useToast()
  const { favs, toggle, addMany } = useFavorites()
  const ui = useMemo(() => readLS('ba-ui', { view: 'grid', sort: 'name', dir: 1 }), [])

  const [q, setQ] = useState('')
  const [sort, setSort] = useState(ui.sort === 'rel' ? 'name' : ui.sort)
  const [dir, setDir] = useState(ui.dir)
  const [view, setView] = useState(ui.view)
  const [sel, setSel] = useState(emptySel)
  const [favOnly, setFavOnly] = useState(false)
  const [current, setCurrent] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const prevSort = useRef('name'), searchRef = useRef(null), sentinel = useRef(null)
  const [shown, setShown] = useState(PAGE)

  useEffect(() => { writeLS('ba-ui', { view, sort: sort === 'rel' ? 'name' : sort, dir }) }, [view, sort, dir])

  /* Tìm kiếm: khi có từ khóa tự chuyển sang "Liên quan nhất", xóa từ khóa thì khôi phục */
  const onQuery = (v) => {
    const had = !!q.trim(), has = !!v.trim()
    setQ(v)
    if (has && !had && sort !== 'rel') { prevSort.current = sort; setSort('rel') }
    if (!has && had && sort === 'rel') setSort(prevSort.current || 'name')
  }

  const dq = useDeferredValue(q)
  const { list, parsed } = useMemo(() => filterStudents({ q: dq, sel, sort, dir, favOnly, favs }), [dq, sel, sort, dir, favOnly, favOnly ? favs : null])
  useEffect(() => { setShown(PAGE) }, [dq, sel, sort, dir, favOnly])
  useEffect(() => {
    const el = sentinel.current
    if (!el || shown >= list.length) return
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setShown((n) => n + PAGE) }, { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [shown, list.length])
  const activeCount = useMemo(() => GROUPS.reduce((n, g) => n + sel[g.k].length, 0), [sel])

  const toggleSel = useCallback((g, v) => setSel((s) => ({ ...s, [g]: s[g].includes(v) ? s[g].filter((x) => x !== v) : [...s[g], v] })), [])
  const clearAll = () => { setSel(emptySel()); onQuery(''); setFavOnly(false) }

  /* ── Chi tiết + deep link #Tên ── */
  const openStudent = useCallback((s) => {
    setCurrent(s); setDetailOpen(true)
    document.title = `${s.name} – BA List`
    try { history.replaceState(null, '', '#' + encodeURIComponent(s.name)) } catch { /* bỏ qua */ }
  }, [])
  const closeDetail = useCallback(() => {
    setDetailOpen(false)
    document.title = BASE_TITLE
    try { history.replaceState(null, '', location.pathname + location.search) } catch { /* bỏ qua */ }
  }, [])
  useEffect(() => {
    const go = () => { const s = BY_NAME.get(hashName()); if (s) openStudent(s) }
    go(); addEventListener('hashchange', go)
    return () => removeEventListener('hashchange', go)
  }, [openStudent])

  /* ── Yêu thích ── */
  const favRef = useRef(favs); favRef.current = favs
  const onFav = useCallback((s) => {
    const had = favRef.current.has(s.name)
    toggle(s.name)
    ;(had ? toast.info : toast.success)(t(had ? 'fav.removed' : 'fav.added'), { sub: s.name, key: 'fav', ms: 1800 })
  }, [toggle, toast, t])

  /* ── Phím tắt + trạng thái mạng ── */
  useEffect(() => {
    const k = (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)
      if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); searchRef.current?.focus() }
    }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])
  useEffect(() => {
    const off = () => toast.warning(t('toast.offline'), { sub: t('toast.offlineSub'), key: 'net' })
    const on = () => toast.success(t('toast.online'), { key: 'net', ms: 1800 })
    addEventListener('offline', off); addEventListener('online', on)
    return () => { removeEventListener('offline', off); removeEventListener('online', on) }
  }, [toast, t])

  const sortOptions = useMemo(() => SORTS.map((k) => ({ value: k, label: t(`sort.${k}`) })), [t])
  const sugg = !list.length && !favOnly ? suggest(parsed) : ''
  const DirIcon = dir > 0 ? ArrowUpNarrowWide : ArrowDownWideNarrow
  const chips = GROUPS.flatMap((g) => sel[g.k].map((v) => ({ g, v, label: valueLabel(g, v, GROUP_VALUES[g.k].find((x) => x.v === v)?.sample, t) })))

  return (
    <div className="min-h-dvh pb-24">
      {/* ── Thanh trên cùng ── */}
      <header className="sticky top-0 z-20 border-b-[3px] border-primary bg-surface-low">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-3 px-4 lg:px-6">
          <a href="./" className="flex shrink-0 items-center gap-2.5" aria-label="BA List">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="40" height="40" className="size-10" />
            <h1 className="hidden text-[1.45rem] font-black italic tracking-tight sm:block">BA <span className="text-primary">List</span></h1>
          </a>
          <label className="slant group mx-auto flex h-11 min-w-0 max-w-2xl flex-1 items-center gap-3 bg-surface-high px-8 transition-shadow duration-200 [--s:14px] focus-within:shadow-[inset_0_-4px_0_var(--ba-primary)]">
            <Search size={19} className="shrink-0 text-primary" />
            <input
              ref={searchRef} value={q} onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { onQuery(''); e.currentTarget.blur() } }}
              placeholder={t('search.placeholder')} aria-label={t('search.placeholder')}
              autoComplete="off" spellCheck="false" enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-on-surface-variant/80"
            />
            {q
              ? <button type="button" onClick={() => { onQuery(''); searchRef.current?.focus() }} aria-label={t('search.clear')} className="grid size-7 shrink-0 place-items-center text-on-surface-variant hover:text-primary"><X size={18} /></button>
              : <kbd className="hidden border border-outline-variant px-1.5 text-xs font-bold text-on-surface-variant group-focus-within:hidden sm:block">/</kbd>}
          </label>
          <IconButton variant="filled" size="lg" onClick={() => setSettingsOpen(true)} aria-label={t('set.open')} title={t('set.title')}><Settings size={22} /></IconButton>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 pt-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        {/* ── Bộ lọc (desktop) ── */}
        <aside className="sticky top-[88px] hidden max-h-[calc(100dvh-104px)] self-start overflow-hidden rounded-md border border-outline-variant bg-surface-low shadow-[0_2px_0_var(--ba-outline-variant)] lg:flex lg:flex-col">
          <FilterPanel sel={sel} onToggle={toggleSel} onClear={() => setSel(emptySel())} activeCount={activeCount} />
        </aside>

        <main className="min-w-0 [content-visibility:auto]">
          {/* ── Thanh công cụ ── */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button" onClick={() => setFilterOpen(true)} aria-label={t('filter.open')}
              className="slant relative inline-flex h-10 items-center gap-2 bg-primary px-7 text-sm font-bold italic text-on-primary transition-all duration-200 ease-out-back active:scale-95 lg:hidden"
            >
              <SlidersHorizontal size={17} />{t('filter.title')}
              {activeCount > 0 && <span className="slant grid h-5 min-w-6 place-items-center bg-hl px-1.5 text-[0.7rem] font-extrabold not-italic text-on-hl [--s:4px]">{activeCount}</span>}
            </button>
            <Select value={sort} options={sortOptions} onChange={setSort} label={t('sort.label')} icon={ArrowUpDown} className="min-w-[9rem] flex-1 sm:w-60 sm:flex-none" />
            <IconButton variant="flat" onClick={() => setDir((d) => -d)} aria-label={t('dir.toggle')} title={dir > 0 ? t('dir.asc') : t('dir.desc')} className="!size-10"><DirIcon size={19} /></IconButton>
            <button
              type="button" aria-pressed={favOnly} onClick={() => setFavOnly((v) => !v)}
              className={cx('slant inline-flex h-10 items-center gap-1.5 px-7 text-sm font-bold italic transition-all duration-200 ease-out-back active:scale-95', favOnly ? 'bg-hl text-on-hl' : 'bg-surface-high hover:bg-surface-highest')}
            >
              <Heart size={16} className={favOnly ? 'fill-[#ff5c7a] text-[#ff5c7a]' : 'text-[#ff5c7a]'} />
              {t('fav.only')}{favs.size > 0 && <span className="text-xs opacity-70">{favs.size}</span>}
            </button>
            <Segmented
              className="ml-auto" value={view} onChange={setView}
              options={[
                { value: 'grid', label: t('view.grid'), icon: <LayoutGrid size={17} />, iconOnly: true },
                { value: 'rows', label: t('view.list'), icon: <List size={17} />, iconOnly: true },
              ]}
            />
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold italic text-on-surface-variant" aria-live="polite">
            <span className="slant h-4 w-2 bg-primary [--s:3px]" />{t('count', { n: list.length, total: STUDENTS.length })}
          </p>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map(({ g, v, label }) => (
                <button
                  key={g.k + v} type="button" onClick={() => toggleSel(g.k, v)}
                  className="slant inline-flex h-8 animate-pop items-center gap-1.5 bg-primary pl-6 pr-5 text-[0.82rem] font-semibold italic text-on-primary transition-transform active:scale-95"
                >{label}<X size={14} strokeWidth={3} /></button>
              ))}
              <button type="button" onClick={() => setSel(emptySel())} className="h-8 px-3 text-[0.82rem] font-bold italic text-primary hover:underline">{t('filter.clearAll')}</button>
            </div>
          )}

          {/* ── Danh sách ── */}
          <div className="mt-4">
            {list.length === 0 ? (
              <div className="mx-auto flex max-w-md animate-rise flex-col items-center gap-3 px-4 py-16 text-center">
                <span className="slant stripes-on-primary grid h-24 w-28 place-items-center bg-primary text-on-primary [--s:18px]">
                  {favOnly ? <Heart size={40} /> : <SearchX size={40} />}
                </span>
                <b className="text-lg font-extrabold italic">{favOnly && !favs.size ? t('fav.emptyTitle') : t('empty.title')}</b>
                <p className="text-on-surface-variant">{favOnly && !favs.size ? t('fav.emptyHint') : t('empty.hint')}</p>
                {sugg && (
                  <p className="text-on-surface-variant">{t('empty.suggest')}{' '}
                    <button type="button" onClick={() => onQuery(sugg)} className="slant bg-hl px-5 py-1 font-bold italic text-on-hl [--s:7px]">{sugg}</button>?
                  </p>
                )}
                {(activeCount > 0 || q || favOnly) && (
                  <button type="button" onClick={clearAll} className="slant mt-1 h-10 bg-surface-high px-8 text-sm font-bold italic hover:bg-primary hover:text-on-primary">{t('filter.clear')}</button>
                )}
              </div>
            ) : view === 'grid' ? (
              <div key={`g${lang}`} className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(184px,1fr))] sm:gap-4">
                {list.slice(0, shown).map((s, i) => <StudentCard key={s.name} s={s} index={i} fav={favs.has(s.name)} onOpen={openStudent} onFav={onFav} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <ListHeader />
                {list.slice(0, shown).map((s, i) => <StudentRow key={s.name} s={s} index={i} fav={favs.has(s.name)} onOpen={openStudent} onFav={onFav} />)}
              </div>
            )}
          </div>
          {shown < list.length && <div ref={sentinel} className="h-10" aria-hidden="true" />}
        </main>
      </div>

      <ScrollTop />

      {/* ── Sheets ── */}
      <DetailSheet student={current} open={detailOpen} list={list} onClose={closeDetail} onOpenStudent={openStudent} isFav={current ? favs.has(current.name) : false} onFav={onFav} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} list={list} favs={favs} onImport={addMany} />
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} variant="bottom" label={t('filter.title')}>
        <FilterPanel sel={sel} onToggle={toggleSel} onClear={() => setSel(emptySel())} activeCount={activeCount} className="flex-1">
          <IconButton variant="flat" size="sm" onClick={() => setFilterOpen(false)} aria-label={t('close')}><X size={19} /></IconButton>
        </FilterPanel>
        <div className="shrink-0 border-t border-outline-variant px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <button type="button" onClick={() => setFilterOpen(false)} className="slant h-12 w-full bg-hl text-[0.95rem] font-extrabold italic text-on-hl transition-all duration-200 ease-out-back hover:brightness-105 active:scale-[0.97] [--s:16px]">
            {list.length ? t('filter.apply', { n: list.length }) : t('filter.none')}
          </button>
        </div>
      </Sheet>
    </div>
  )
}
