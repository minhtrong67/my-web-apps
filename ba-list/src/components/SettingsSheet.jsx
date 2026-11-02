import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Download, Heart, Languages, Monitor, Moon, Palette, RotateCcw, Settings, Smartphone, Sparkles, Sun, Type, Upload, X } from 'lucide-react'
import { ACCENTS, useSettings, useToast } from '../lib/app-context.jsx'
import { FONT_LIST, fontStack, getFont, loadFont } from '../lib/fonts.js'
import { LANGS } from '../lib/i18n.js'
import { BY_NAME, STUDENTS, cleanForExport } from '../lib/students.js'
import Sheet from './Sheet.jsx'
import { IconButton, Segmented, Switch, cx } from './ui.jsx'

/* Mục dạng accordion: bấm tiêu đề để đóng/mở (mở/đóng mượt bằng grid-template-rows, nội dung đóng thì inert) */
function Panel({ icon: Icon, title, hint, defaultOpen = false, onToggle, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  useEffect(() => { onToggle?.(open) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="rounded-md border border-outline-variant bg-surface-mid">
      <button
        type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="slant inline-flex h-8 items-center gap-2 bg-primary pl-4 pr-7 text-sm font-bold italic tracking-wide text-on-primary transition-[filter] [--s:9px] group-hover:brightness-110">
          <Icon size={16} strokeWidth={2.5} />{title}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold italic text-on-surface-variant">
          {!open && hint && <span className="min-w-0 truncate">{hint}</span>}
          <ChevronDown size={20} className={cx('shrink-0 text-primary transition-transform duration-300 ease-out-back', open && 'rotate-180')} />
        </span>
      </button>
      <div id={id} inert={!open} className={cx('grid transition-[grid-template-rows] duration-300 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="min-h-0 overflow-hidden">
          <div className={cx('px-4 pb-4 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}>{children}</div>
        </div>
      </div>
    </section>
  )
}

const download = (name, data) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
const btn = 'slant inline-flex h-11 items-center justify-center gap-2 bg-surface-high px-6 text-sm font-bold italic transition-all duration-200 ease-out-back hover:bg-primary hover:text-on-primary active:scale-95 disabled:pointer-events-none disabled:opacity-40'

export default function SettingsSheet({ open, onClose, list, favs, onImport }) {
  const { cfg, update, reset, t, lang } = useSettings()
  const toast = useToast()
  const file = useRef(null)
  const [bip, setBip] = useState(() => window.__bip || null)
  const [fontOpen, setFontOpen] = useState(false)
  useEffect(() => { if (fontOpen) FONT_LIST.forEach((f) => loadFont(f.id)) }, [fontOpen])
  useEffect(() => {
    const on = () => setBip(window.__bip || null)
    window.addEventListener('bip', on)
    return () => window.removeEventListener('bip', on)
  }, [])

  const exportData = (all) => {
    const a = all ? STUDENTS : list
    download(`ba-list-${all ? 'all' : 'filtered'}.json`, a.map(cleanForExport))
    toast.success(t('toast.exported'), { sub: `${a.length} · ba-list-${all ? 'all' : 'filtered'}.json`, key: 'exp' })
  }
  const exportFavs = () => {
    download('ba-list-favorites.json', { app: 'ba-list', favorites: [...favs] })
    toast.success(t('toast.exported'), { sub: `${favs.size} · ba-list-favorites.json`, key: 'exp' })
  }
  const importFavs = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const j = JSON.parse(await f.text())
      const arr = Array.isArray(j) ? j : j.favorites
      const names = arr.map((x) => (typeof x === 'string' ? x : x?.name)).filter((n) => BY_NAME.has(n))
      if (!names.length) throw new Error('empty')
      onImport(names)
      toast.success(t('toast.imported'), { sub: t('toast.importSub', { n: names.length }), key: 'imp' })
    } catch { toast.error(t('toast.importFail'), { sub: t('toast.importFailSub'), key: 'imp' }) }
  }
  const install = async () => {
    if (!bip) return
    bip.prompt()
    const r = await bip.userChoice
    window.__bip = null; setBip(null)
    if (r.outcome === 'accepted') toast.success(t('toast.installed'))
  }

  return (
    <Sheet open={open} onClose={onClose} label={t('set.title')}>
      <header className="flex shrink-0 items-center gap-3 border-b-[3px] border-primary px-4 pb-3 pt-0 md:pl-10 md:pr-4 md:pt-5">
        <span className="slant grid size-12 shrink-0 place-items-center bg-primary text-on-primary [--s:9px]"><Settings size={24} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold italic leading-tight">{t('set.title')}</h2>
          <p className="text-sm text-on-surface-variant">{t('set.sub')}</p>
        </div>
        <IconButton variant="flat" size="sm" onClick={onClose} aria-label={t('close')}><X size={19} /></IconButton>
      </header>

      {/* Khung cuộn → lưới (các khối KHÔNG bị co lại như flex-col trước đây nên không còn bị cắt) */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="grid content-start gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:pl-10 md:pr-5">
          <Panel icon={Sun} title={t('set.theme')} hint={t(`theme.${cfg.theme}`)} defaultOpen>
            <Segmented
              value={cfg.theme} onChange={(v) => update({ theme: v })}
              options={[
                { value: 'light', label: t('theme.light'), icon: <Sun size={16} /> },
                { value: 'dark', label: t('theme.dark'), icon: <Moon size={16} /> },
                { value: 'system', label: t('theme.system'), icon: <Monitor size={16} /> },
              ]}
            />
          </Panel>

          <Panel icon={Palette} title={t('set.color')} hint={<span className="slant inline-block h-5 w-8 align-middle [--s:5px]" style={{ background: cfg.ac }} />} defaultOpen>
            <div className="grid grid-cols-7 gap-1.5">
              {ACCENTS.map((c) => (
                <button
                  key={c} type="button" aria-label={c} title={c} aria-pressed={cfg.ac === c} onClick={() => update({ ac: c })}
                  style={{ background: c }}
                  className={cx('slant grid h-10 place-items-center transition-all duration-200 ease-out-back active:scale-90', cfg.ac === c ? 'text-white shadow-[inset_0_-5px_0_var(--ba-hl)]' : 'hover:scale-105')}
                >{cfg.ac === c && <Check size={18} strokeWidth={4} className="animate-pop drop-shadow" />}</button>
              ))}
              <label title={t('set.customColor')} className="slant relative grid h-10 cursor-pointer place-items-center bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] transition-transform hover:scale-105">
                <span className="slant h-5 w-6 border-2 border-white [--s:4px]" style={{ background: cfg.ac }} />
                <input type="color" value={cfg.ac} onChange={(e) => update({ ac: e.target.value }, { animate: false })} aria-label={t('set.customColor')} className="absolute inset-0 size-full cursor-pointer opacity-0" />
              </label>
            </div>
          </Panel>

          <Panel icon={Languages} title={t('set.lang')} hint={LANGS[lang]} defaultOpen>
            <Segmented value={lang} onChange={(v) => update({ lang: v })} options={Object.entries(LANGS).map(([value, label]) => ({ value, label }))} />
          </Panel>

          <Panel icon={Type} title={t('set.font')} hint={getFont(cfg.ff).label} onToggle={setFontOpen}>
            <div className="grid gap-1.5" role="radiogroup" aria-label={t('set.font')}>
              {FONT_LIST.map((f) => (
                <button
                  key={f.id} type="button" role="radio" aria-checked={cfg.ff === f.id} onClick={() => update({ ff: f.id })}
                  style={{ fontFamily: fontStack(f.id) }}
                  className={cx('slant flex h-12 items-center gap-3 px-7 text-left transition-all duration-200 ease-out-back active:scale-[0.98]', cfg.ff === f.id ? 'bg-primary text-on-primary' : 'bg-surface-high hover:bg-surface-highest')}
                >
                  <b className="w-9 text-xl leading-none">Aa</b>
                  <span className="flex-1 truncate text-sm font-semibold">{f.label}</span>
                  {cfg.ff === f.id && <Check size={16} strokeWidth={4} />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm font-bold italic"><span>{t('set.size')}</span><span className="text-primary">{cfg.fs}px</span></div>
            <div className="mt-1 flex items-center gap-3">
              <small className="text-on-surface-variant">A</small>
              <input type="range" min="12" max="20" value={cfg.fs} onChange={(e) => update({ fs: +e.target.value })} aria-label={t('set.size')} className="h-2 w-full cursor-pointer accent-primary" />
              <big className="text-lg text-on-surface-variant">A</big>
            </div>
          </Panel>

          <Panel icon={Sparkles} title={t('set.anim')} hint={cfg.motion !== 0 ? 'ON' : 'OFF'}>
            <Switch checked={cfg.motion !== 0} onChange={(v) => update({ motion: v ? 1 : 0 })} label={t('set.motion')} hint={t('set.motionHint')} />
          </Panel>

          <Panel icon={Download} title={t('set.data')} hint={`${favs.size} ♥`}>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={btn} onClick={() => exportData(true)}><Download size={17} />{t('set.exportAll', { n: STUDENTS.length })}</button>
              <button type="button" className={btn} onClick={() => exportData(false)}><Download size={17} />{t('set.exportCur', { n: list.length })}</button>
              <button type="button" className={btn} onClick={exportFavs} disabled={!favs.size}><Heart size={17} />{t('set.exportFavs', { n: favs.size })}</button>
              <button type="button" className={btn} onClick={() => file.current?.click()}><Upload size={17} />{t('set.import')}</button>
            </div>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={importFavs} />
            {bip && (
              <button type="button" onClick={install} className="slant mt-2 inline-flex h-12 w-full items-center justify-center gap-2 bg-hl text-sm font-extrabold italic text-on-hl transition-all duration-200 ease-out-back hover:brightness-105 active:scale-95">
                <Smartphone size={18} />{t('set.install')}
              </button>
            )}
            <button
              type="button" onClick={() => { reset(); toast.info(t('toast.reset'), { key: 'rst' }) }}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 text-sm font-bold italic text-error transition-colors hover:bg-error/10 active:scale-95"
            ><RotateCcw size={17} />{t('set.reset')}</button>
          </Panel>

          {/* Thông tin tác giả: chỉ hiển thị ở cuối trang Cài đặt */}
          <div className="stripes-on-primary cut-bl relative overflow-hidden rounded-md bg-navy px-5 pb-8 pt-5 text-on-navy">
            <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border-[16px] border-primary/30" />
            <span className="slant inline-block bg-hl px-5 py-0.5 text-xs font-extrabold uppercase italic tracking-widest text-on-hl [--s:7px]">{t('set.about')}</span>
            <p className="relative mt-3 text-lg font-bold italic leading-snug">
              {t('set.aboutBy', { author: '' })}<span className="slant ml-1 inline-block bg-primary px-4 font-extrabold text-on-primary [--s:7px]">minhtrong67</span>
            </p>
            <p className="relative mt-1.5 text-sm text-on-navy/75">{t('set.aboutAi', { ai: 'Claude' })}</p>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
