import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, FilterX, Flag, Heart, LayoutGrid, List, RefreshCw, Search, Settings, SearchX, Trophy, X, Hash, ArrowDownAZ, Users, CaseUpper, Shuffle, Download, IdCard } from 'lucide-react';
import { CHARACTERS, GROUPS, LETTERS, PREFIXES, PROFILE_COUNT, bdayKey } from './data/characters';
import { useSettings, useStored } from './lib/settings';
import { useToast } from './components/Toast';
import { Button, IconButton } from './components/ui';
import ExportDialog from './components/ExportDialog';
import Select from './components/Select';
import CharacterCard from './components/CharacterCard';
import DetailDialog from './components/DetailDialog';
import SettingsSheet from './components/SettingsSheet';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('copy failed');
  }
}

const PAGE = 48;
const readUrl = () => {
  const p = new URLSearchParams(location.search);
  const sorts = ['default', 'az', 'za', 'height', 'birthday'];
  return {
    q: p.get('q') || '',
    groups: (p.get('g') || '').split(',').filter((x) => GROUPS.some((g) => g.id === x)),
    prefix: PREFIXES.some((x) => x.name === p.get('p')) ? p.get('p') : 'all',
    letter: LETTERS.includes(p.get('l')) ? p.get('l') : 'all',
    sort: sorts.includes(p.get('s')) ? p.get('s') : 'default',
    fav: p.get('fav') === '1',
    prof: p.get('prof') === '1',
    c: CHARACTERS.some((c) => c.id === p.get('c')) ? p.get('c') : null
  };
};
const INIT = readUrl();

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f.'\-\s]/g, '');

export default function App() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [q, setQ] = useState(INIT.q);
  const [groups, setGroups] = useState(INIT.groups);
  const [prefix, setPrefix] = useState(INIT.prefix);
  const [letter, setLetter] = useState(INIT.letter);
  const [sort, setSort] = useState(INIT.sort);
  const [favOnly, setFavOnly] = useState(INIT.fav);
  const [profOnly, setProfOnly] = useState(INIT.prof);
  const [visible, setVisible] = useState(PAGE);
  const [copiedId, setCopiedId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const sentinel = useRef(null);
  const copyTimer = useRef();
  const [view, setView] = useStored('uma.view', 'grid');
  const [favs, setFavs] = useStored('uma.favs', []);
  const [openId, setOpenId] = useState(INIT.c);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const search = useRef(null);

  const favSet = useMemo(() => new Set(favs), [favs]);
  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.id, CHARACTERS.filter((c) => c.group === g.id).length])), []);

  const list = useMemo(() => {
    const nq = norm(q);
    let r = CHARACTERS.filter((c) =>
      (!nq || norm(c.name).includes(nq)) &&
      (!groups.length || groups.includes(c.group)) &&
      (prefix === 'all' || c.prefix === prefix) &&
      (letter === 'all' || c.initial === letter) &&
      (!favOnly || favSet.has(c.id)) &&
      (!profOnly || c.d)
    );
    if (sort === 'az') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'za') r = [...r].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'height') r = [...r].sort((a, b) => (b.d?.height ?? -1) - (a.d?.height ?? -1));
    if (sort === 'birthday') r = [...r].sort((a, b) => (a.d?.birthday ? bdayKey(a.d.birthday) : 9999) - (b.d?.birthday ? bdayKey(b.d.birthday) : 9999));
    return r;
  }, [q, groups, prefix, letter, sort, favOnly, profOnly, favSet]);

  const filtersActive = !!(q || groups.length || prefix !== 'all' || letter !== 'all' || sort !== 'default' || favOnly || profOnly);
  const resetFilters = () => { setQ(''); setGroups([]); setPrefix('all'); setLetter('all'); setSort('default'); setFavOnly(false); setProfOnly(false); };

  const copyName = useCallback(async (c) => {
    try {
      await copyText(c.name);
      setCopiedId(c.id);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedId(null), 1600);
    } catch { toast({ variant: 'error', message: t('copyFail') }); }
  }, [t, toast]);
  const copyLink = useCallback(async () => {
    try { await copyText(location.href); toast({ id: 'link', variant: 'success', message: t('linkCopied') }); }
    catch { toast({ variant: 'error', message: t('copyFail') }); }
  }, [t, toast]);
  const surprise = () => { const pool = list.length ? list : CHARACTERS; setOpenId(pool[Math.floor(Math.random() * pool.length)].id); };
  const toggleFav = useCallback((id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])), [setFavs]);
  const nav = useCallback((d) => {
    setOpenId((id) => { const i = list.findIndex((c) => c.id === id); const n = list[i + d]; return n ? n.id : id; });
  }, [list]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (groups.length) p.set('g', groups.join(','));
    if (prefix !== 'all') p.set('p', prefix);
    if (letter !== 'all') p.set('l', letter);
    if (sort !== 'default') p.set('s', sort);
    if (favOnly) p.set('fav', '1');
    if (profOnly) p.set('prof', '1');
    if (openId) p.set('c', openId);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }, [q, groups, prefix, letter, sort, favOnly, profOnly, openId]);

  useEffect(() => { setVisible(PAGE); }, [q, groups, prefix, letter, sort, favOnly, profOnly, view]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setVisible((v) => v + PAGE); }, { rootMargin: '700px' });
    io.observe(el);
    return () => io.disconnect();
  }, [list, visible]);

  const selected = openId ? CHARACTERS.find((c) => c.id === openId) : null;

  useEffect(() => {
    const onScroll = () => setShowTop(scrollY > 480);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName) && !document.querySelector('[role="dialog"]')) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const need = () => toast({ id: 'update', variant: 'info', title: t('updateTitle'), message: t('updateMsg'), duration: 0, action: { label: t('update'), icon: RefreshCw, onClick: () => window.__updateSW?.(true) } });
    const ready = () => toast({ id: 'ready', variant: 'info', message: t('offlineReady') });
    const off = () => toast({ id: 'net', variant: 'warning', message: t('offline') });
    const on = () => toast({ id: 'net', variant: 'info', message: t('online') });
    addEventListener('pwa-need-refresh', need);
    addEventListener('pwa-offline-ready', ready);
    addEventListener('offline', off);
    addEventListener('online', on);
    return () => { removeEventListener('pwa-need-refresh', need); removeEventListener('pwa-offline-ready', ready); removeEventListener('offline', off); removeEventListener('online', on); };
  }, [t, toast]);

  const toggleGroup = (id) => setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const prefixOpts = [{ value: 'all', label: t('allPrefixes') }, ...PREFIXES.map((p) => ({ value: p.name, label: p.name, hint: p.count }))];
  const letterOpts = [{ value: 'all', label: t('allLetters') }, ...LETTERS.map((l) => ({ value: l, label: l }))];
  const sortOpts = [{ value: 'default', label: t('sortDefault') }, { value: 'az', label: t('sortAZ') }, { value: 'za', label: t('sortZA') }, { value: 'height', label: t('sortHeight') }, { value: 'birthday', label: t('sortBirthday') }];

  return (
    <div className="mx-auto min-h-dvh max-w-7xl px-3 pb-24 sm:px-6">
      <header className="sticky top-0 z-40 -mx-3 flex items-center gap-2 border-b border-line bg-bg/85 px-3 py-2.5 backdrop-blur-xl sm:-mx-6 sm:gap-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary shadow-md"><Trophy className="size-5" aria-hidden /></span>
          <span className="hidden text-lg font-black italic tracking-tight sm:block">{t('appName')}</span>
        </div>
        <label className="relative mx-auto flex min-w-0 max-w-xl flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 size-[1.1rem] text-ink-2" aria-hidden />
          <input
            ref={search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchPh')}
            aria-label={t('searchPh')}
            title={t('focusSearch')}
            className="w-full rounded-full border border-line bg-surface-2 py-2.5 pl-10 pr-10 text-sm font-medium outline-none transition placeholder:text-ink-2 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          {q && <span className="absolute right-1"><IconButton icon={X} label={t('clearSearch')} onClick={() => { setQ(''); search.current?.focus(); }} className="!size-8" /></span>}
        </label>
        <div className="flex items-center gap-0.5 rounded-full bg-surface-2 p-0.5">
          <IconButton icon={LayoutGrid} label={t('viewGrid')} active={view === 'grid'} onClick={() => setView('grid')} />
          <IconButton icon={List} label={t('viewList')} active={view === 'list'} onClick={() => setView('list')} />
        </div>
        <IconButton icon={Settings} label={t('settings')} onClick={() => setSettingsOpen(true)} className="bg-surface-2" side="bottom" />
      </header>

      <section className="turf relative mt-5 overflow-hidden rounded-3xl px-6 py-8 text-on-primary sm:px-10 sm:py-12">
        <div className="finish absolute inset-y-0 right-0 w-24 sm:w-44" aria-hidden />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-xs font-bold"><Flag className="size-3.5" aria-hidden />Umamusume: Pretty Derby</span>
          <h1 className="mt-3 text-3xl font-black italic leading-[1.05] tracking-tight sm:text-5xl">{t('bannerTitle')}</h1>
          <p className="mt-2.5 max-w-md text-sm font-medium opacity-90 sm:text-base">{t('bannerSub')}</p>
          <p className="mt-4 text-sm font-bold">{CHARACTERS.length} {t('charactersWord')}</p>
        </div>
        <div className="lane absolute inset-x-0 bottom-3 h-[3px]" aria-hidden />
      </section>

      <section className="mt-5 rounded-3xl border border-line bg-surface p-3.5 shadow-sm sm:p-4" aria-label="Filters">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={!groups.length}
            onClick={() => setGroups([])}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-95 ${!groups.length ? 'bg-primary text-on-primary' : 'bg-surface-2 hover:bg-primary/15'}`}
          >{t('all')} <span className="opacity-75">{CHARACTERS.length}</span></button>
          {GROUPS.map((g) => {
            const on = groups.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGroup(g.id)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-95"
                style={on ? { background: g.color, borderColor: g.color, color: '#fff' } : { borderColor: `color-mix(in oklab, ${g.color} 40%, var(--line))` }}
              >
                {!on && <span className="size-2 rounded-full" style={{ background: g.color }} />}
                {t(`g_${g.id}`)} <span className="opacity-75">{counts[g.id]}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-[repeat(3,1fr)_auto_auto_auto]">
          <Select label={t('prefix')} icon={Users} value={prefix} onChange={setPrefix} options={prefixOpts} />
          <Select label={t('initial')} icon={CaseUpper} value={letter} onChange={setLetter} options={letterOpts} />
          <Select label={t('sort')} icon={ArrowDownAZ} value={sort} onChange={setSort} options={sortOpts} className="col-span-2 md:col-span-1" />
          <button
            type="button"
            aria-pressed={favOnly}
            onClick={() => setFavOnly((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-95 ${favOnly ? 'border-rose-500 bg-rose-500 text-white' : 'border-line bg-surface-2 hover:border-rose-400'}`}
          >
            <Heart className={`size-4 ${favOnly ? 'fill-current' : ''}`} aria-hidden />{t('favoritesOnly')}{favs.length > 0 && <span className="opacity-75">{favs.length}</span>}
          </button>
          <button
            type="button"
            aria-pressed={profOnly}
            onClick={() => setProfOnly((v) => !v)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-95 ${profOnly ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface-2 hover:border-primary/60'}`}
          >
            <IdCard className="size-4" aria-hidden />{t('hasProfile')} <span className="opacity-75">{PROFILE_COUNT}</span>
          </button>
          <button
            type="button"
            disabled={!filtersActive}
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-xl bg-surface-3 px-4 py-2 text-sm font-semibold transition enabled:hover:brightness-95 enabled:active:scale-95 disabled:opacity-40"
          >
            <FilterX className="size-4" aria-hidden />{t('resetFilters')}
          </button>
        </div>
      </section>

      <div className="mb-3 mt-5 flex items-center justify-between gap-2 px-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-2" aria-live="polite">
          <Hash className="size-4" aria-hidden />{t('showing', { n: list.length, total: CHARACTERS.length })}
        </p>
        <div className="flex items-center">
          <IconButton icon={Shuffle} label={t('random')} onClick={surprise} />
          <IconButton icon={Download} label={t('exportList')} onClick={() => setExportOpen(true)} />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-pc text-accent">{favOnly && !favs.length ? <Heart className="size-8" aria-hidden /> : <SearchX className="size-8" aria-hidden />}</span>
          <p className="mt-4 text-lg font-extrabold">{favOnly && !favs.length ? t('noFav') : t('noResults')}</p>
          <p className="mt-1 max-w-xs text-sm text-ink-2">{favOnly && !favs.length ? t('noFavHint') : t('noResultsHint')}</p>
          {filtersActive && <Button className="mt-5" icon={FilterX} onClick={resetFilters}>{t('resetFilters')}</Button>}
        </div>
      ) : (
        <div
          key={`${view}|${q}|${groups}|${prefix}|${letter}|${sort}|${favOnly}|${profOnly}`}
          className={view === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'flex flex-col gap-2.5'}
        >
          {list.slice(0, visible).map((c, i) => (
            <CharacterCard key={c.id} c={c} view={view} index={i} fav={favSet.has(c.id)} copied={copiedId === c.id} q={q} onOpen={setOpenId} onCopy={copyName} onFav={toggleFav} />
          ))}
        </div>
      )}
      {visible < list.length && <div ref={sentinel} className="py-8 text-center text-sm font-semibold text-ink-2">{t('loadingMore')}</div>}

      <footer className="mt-12 border-t border-line pt-5 text-center text-xs leading-relaxed text-ink-2">{t('footer')}</footer>

      <div className={`fixed bottom-5 right-4 z-40 transition-all duration-300 sm:right-6 ${showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
        <IconButton
          icon={ArrowUp}
          label={t('scrollTop')}
          onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
          className="!size-12 bg-primary !text-on-primary shadow-xl hover:!bg-primary hover:brightness-110"
          iconClass="!size-5"
          tabIndex={showTop ? 0 : -1}
        />
      </div>

      <DetailDialog c={selected} list={list} fav={selected ? favSet.has(selected.id) : false} copied={!!selected && copiedId === selected.id} onCopyLink={copyLink} onClose={() => setOpenId(null)} onNav={nav} onCopy={copyName} onFav={toggleFav} />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        favCount={favs.length}
        onClearFavs={() => setFavs([])}
        onToast={toast}
        onExport={() => { setSettingsOpen(false); setExportOpen(true); }}
      />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} all={CHARACTERS} filtered={list} favSet={favSet} filtersActive={filtersActive} onToast={toast} />
    </div>
  );
}
