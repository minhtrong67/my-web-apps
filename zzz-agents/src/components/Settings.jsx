import { useSettings, COLORS, FONTS, onHex } from '../settings.jsx'
import { useRef, useState } from 'react'
import { useLayer } from '../useLayer.js'
import { factions } from '../data.js'
import Select from './Select.jsx'
import Modal from './Modal.jsx'
import { Btn } from './Btn.jsx'
import { IconBtn } from './Btn.jsx'
import Ic from '../icons.jsx'
import { useToast } from './Toast.jsx'
import { toJSON, toCSV, download } from '../exporter.js'

const Seg = ({ value, options, onChange }) => (
  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
    {options.map(([v, l]) => (
      <button key={v} onClick={() => onChange(v)}
        className={`cut-sm border px-2 py-2 text-sm font-bold transition ${value === v ? 'border-p bg-p text-onp' : 'border-line bg-surface hover:border-p'}`}>{l}</button>
    ))}
  </div>
)
const Sec = ({ title, children }) => (
  <section className="space-y-2"><h3 className="font-mono text-xs uppercase tracking-widest text-pt">{title}</h3>{children}</section>
)

export default function Settings({ open, onClose, onRefresh, busy, agents, list, favs, onInstall }) {
  const asideRef = useRef(null)
  const { t, mode, color, size, lang, font, detailLang, set, reset } = useSettings()
  const toast = useToast()
  const [ask, setAsk] = useState(false)
  useLayer(asideRef, open, onClose)
  const [scope, setScope] = useState('all')
  const doExport = (ext) => {
    try {
      const rows = (scope === 'all' ? agents : list).map((a) => ({ ...a, faction: factions[a.id] || '', favorite: favs.has(a.id) }))
      const name = `zzz-agents-${new Date().toISOString().slice(0, 10)}.${ext}`
      ext === 'json' ? download(name, toJSON(rows), 'application/json') : download(name, toCSV(rows), 'text/csv')
      toast('success', t('exported').replace('{n}', rows.length).replace('{f}', name))
    } catch { toast('error', t('exportFail')) }
  }
  const names = Object.keys(COLORS)
  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} {...(open ? {} : { inert: '' })}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside ref={asideRef} tabIndex={-1} className={`absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l-2 border-p bg-bg p-5 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-wider">{t('settings')}</h2>
          <IconBtn icon="close" label={t('close')} onClick={onClose} active />
        </div>
        <div className="space-y-6 pb-8">
          <Sec title={t('appearance')}>
            <Seg value={mode} onChange={(v) => set({ mode: v })} options={[['light', t('light')], ['dark', t('dark')], ['system', t('system')]]} />
          </Sec>
          <Sec title={t('color')}>
            <div className="grid grid-cols-4 gap-2">
              {names.map((n, i) => {
                const sel = n === color
                return (
                  <button key={n} onClick={() => set({ color: n })} title={n} aria-pressed={sel}
                    style={{ background: COLORS[n], color: onHex(COLORS[n]) }}
                    className={`cut-sm relative flex h-14 items-end p-1.5 text-left text-[11px] font-bold leading-tight ring-offset-2 ring-offset-bg ${i === names.length - 1 ? 'col-span-2' : ''} ${sel ? 'outline outline-2 outline-offset-2 outline-fg' : ''}`}>
                    <span>{n}</span>
                    {sel && <svg className="absolute right-1.5 top-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m5 12 5 5 9-10" /></svg>}
                  </button>
                )
              })}
            </div>
          </Sec>
          <Sec title={t('fontSize')}>
            <Seg value={size} onChange={(v) => set({ size: v })} options={[['small', t('small')], ['medium', t('medium')], ['large', t('large')]]} />
          </Sec>
          <Sec title={t('language')}>
            <Seg value={lang} onChange={(v) => set({ lang: v })} options={[['en', 'English'], ['vi', 'Tiếng Việt']]} />
          </Sec>
          <Sec title={t('font')}>
            <Select label={t('font')} value={font} onChange={(v) => set({ font: v })}
              options={Object.keys(FONTS).map((f) => ({ value: f, label: f, font: FONTS[f] }))} />
          </Sec>
          <Sec title={t('detailLang')}>
            <Select label={t('detailLang')} value={detailLang} onChange={(v) => set({ detailLang: v })}
              options={[['en', 'English'], ['ja', '日本語'], ['zh', '中文'], ['ko', '한국어']].map(([value, label]) => ({ value, label }))} />
            <p className="text-xs text-muted">{t('detailLangNote')}</p>
          </Sec>
          <Sec title={t('shortcuts')}>
            <div className="space-y-1.5 text-sm">
              {[['Ctrl/⌘ K  ·  /', t('scSearch')], ['G', t('scView')], ['F', t('scFilters')], ['S', t('scSettings')], ['T', t('scTop')], ['← →', t('scNav')]].map(([k, l]) => (
                <div key={k} className="flex items-center justify-between gap-3"><span className="text-muted">{l}</span><kbd className="cut-sm whitespace-nowrap border border-line bg-surface px-2 py-0.5 font-mono text-xs">{k}</kbd></div>
              ))}
            </div>
          </Sec>
          <Sec title={t('data')}>
            <div className="flex flex-wrap items-center gap-3">
              <Btn icon="refresh" variant="info" label={busy ? t('loading') : t('refresh')} onClick={onRefresh} />
              <span className="font-mono text-xs text-muted">{t('source')}: nanoka.cc</span>
            </div>
            {onInstall && <Btn icon="download" variant="success" label={t('install')} onClick={onInstall} className="w-full" />}
          </Sec>
          <Sec title={t('exportData')}>
            <Seg value={scope} onChange={setScope} options={[['all', `${t('scopeAll')} (${agents.length})`], ['filtered', `${t('scopeFiltered')} (${list.length})`]]} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Btn icon="download" variant="primary" label={t('exportJson')} onClick={() => doExport('json')} />
              <Btn icon="download" variant="success" label={t('exportCsv')} onClick={() => doExport('csv')} />
            </div>
          </Sec>
          <Btn icon="trash" variant="danger" label={t('resetSettings')} onClick={() => setAsk(true)} className="w-full" />
          <div className="cut relative overflow-hidden border-2 border-p bg-p/10 p-4">
            <div className="stripes absolute inset-0 opacity-60" />
            <div className="relative space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-pt">{t('author')}</p>
              <p className="text-2xl font-black italic text-pt">minhtrong67</p>
              <p className="flex items-center gap-1.5 text-sm font-bold"><Ic n="info" className="h-4 w-4 text-pt" />{t('aiHelp')} <span className="bg-p px-1.5 text-onp">Claude</span></p>
            </div>
          </div>
        </div>
      </aside>
      <Modal open={ask} onClose={() => setAsk(false)} title={t('resetTitle')}
        footer={<><Btn icon="close" variant="neutral" label={t('cancel')} onClick={() => setAsk(false)} /><Btn icon="trash" variant="danger" label={t('confirm')} onClick={() => { reset(); setAsk(false); toast('info', t('resetDone')) }} /></>}>
        <p className="flex items-start gap-3 text-sm"><Ic n="alert" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />{t('resetMsg')}</p>
      </Modal>
    </div>
  )
}
