import { useEffect, useRef, useState } from 'react'
import { Bot, Check, Code2, Database, DownloadCloud, Languages, LayoutGrid, Monitor, Moon, Palette, RotateCcw, Settings as Cog, Sparkles, Sun, Tag, Type, TextCursorInput, Upload, Download, HardDriveDownload, Layers } from 'lucide-react'
import { COLORS, FONTS, onColor } from '../lib/theme.js'
import { LANGS, useI18n } from '../lib/i18n.jsx'
import { canInstall, promptInstall } from '../lib/pwa.js'
import { Btn, ConfirmDialog, Modal, Segmented, Select, Switch, Tooltip } from './UI.jsx'

function Section({ icon: Icon, title, children }) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink"><Icon className="h-4 w-4" aria-hidden="true" />{title}</h3>
      {children}
    </section>
  )
}

export function SettingsSheet({ open, onClose, st, set, onReset, getBackup, onImport }) {
  const { t } = useI18n()
  const [confirm, setConfirm] = useState(false)
  const [installable, setInstallable] = useState(canInstall())
  const file = useRef(null)

  useEffect(() => {
    const f = () => setInstallable(canInstall())
    window.addEventListener('al-pwa', f)
    return () => window.removeEventListener('al-pwa', f)
  }, [])

  const fontOptions = Object.keys(FONTS).map((k) => ({ value: k, label: k === 'System' ? t('system') : k, fontFamily: FONTS[k] }))
  const nameOptions = [{ value: 'auto', label: t('nameAuto') }, { value: 'en', label: 'English' }, { value: 'jp', label: '日本語' }, { value: 'cn', label: '中文' }, { value: 'kr', label: '한국어' }]

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(getBackup(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `azur-lane-shipgirls-backup-${new Date().toISOString().slice(0, 10)}.json` })
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const pickFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    let json = null
    try { json = JSON.parse(await f.text()) } catch { /* invalid */ }
    onImport(json)
  }

  return (
    <>
      <Modal sheet open={open} onClose={onClose} title={t('settings')} icon={Cog} footer={<Btn tone="primary" icon={Check} onClick={onClose}>{t('done')}</Btn>}>
        <div className="space-y-6">
          <Section icon={Sun} title={t('themeMode')}>
            <Segmented label={t('themeMode')} value={st.theme} onChange={(v) => set('theme', v)} options={[
              { value: 'light', label: t('light'), icon: Sun }, { value: 'dark', label: t('dark'), icon: Moon }, { value: 'system', label: t('system'), icon: Monitor }
            ]} />
          </Section>

          <Section icon={Palette} title={t('accent')}>
            <div role="radiogroup" aria-label={t('accent')} className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
              {Object.entries(COLORS).map(([name, hex]) => (
                <Tooltip key={name} label={name}>
                  <button type="button" role="radio" aria-checked={st.color === name} aria-label={name} onClick={() => set('color', name)} className="swatch" style={{ background: hex, color: onColor(hex) }}>
                    {st.color === name && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </Tooltip>
              ))}
            </div>
            <p className="text-xs text-muted">{st.color}</p>
          </Section>

          <Section icon={TextCursorInput} title={t('fontSize')}>
            <Segmented label={t('fontSize')} value={st.size} onChange={(v) => set('size', v)} options={[{ value: 'sm', label: t('small') }, { value: 'md', label: t('medium') }, { value: 'lg', label: t('large') }]} />
          </Section>

          <Section icon={LayoutGrid} title={t('density')}>
            <Segmented label={t('density')} value={st.density} onChange={(v) => set('density', v)} options={[{ value: 'comfy', label: t('comfy') }, { value: 'compact', label: t('compact') }]} />
          </Section>

          <Section icon={Languages} title={t('language')}>
            <Select label={t('language')} icon={Languages} value={st.lang} onChange={(v) => set('lang', v)} options={LANGS} />
          </Section>

          <Section icon={Tag} title={t('nameLang')}>
            <Select label={t('nameLang')} icon={Tag} value={st.nameLang} onChange={(v) => set('nameLang', v)} options={nameOptions} />
          </Section>

          <Section icon={Type} title={t('font')}>
            <Select label={t('font')} icon={Type} value={st.font} onChange={(v) => set('font', v)} options={fontOptions} />
          </Section>

          <Section icon={Layers} title={t('collab')}>
            <Switch checked={st.collab} onChange={(v) => set('collab', v)} label={t('collab')} desc={t('collabDesc')} />
          </Section>

          {installable && (
            <Section icon={DownloadCloud} title={t('install')}>
              <p className="text-sm text-muted">{t('installDesc')}</p>
              <Btn tone="success" icon={DownloadCloud} className="w-full" onClick={async () => { await promptInstall(); setInstallable(canInstall()) }}>{t('install')}</Btn>
            </Section>
          )}

          <Section icon={HardDriveDownload} title={t('backup')}>
            <p className="text-sm text-muted">{t('backupDesc')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Btn tone="info" icon={Download} onClick={exportBackup}>{t('exportBackup')}</Btn>
              <Btn tone="neutral" icon={Upload} onClick={() => file.current?.click()}>{t('importBackup')}</Btn>
            </div>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={pickFile} />
          </Section>

          <Section icon={Database} title={t('data')}>
            <p className="text-sm leading-relaxed text-muted">{t('dataDesc')}</p>
          </Section>

          <Btn tone="danger" icon={RotateCcw} className="w-full" onClick={() => setConfirm(true)}>{t('resetSettings')}</Btn>

          <div className="author">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink"><Sparkles className="h-4 w-4" aria-hidden="true" />{t('author')}</div>
            <p className="mt-2 flex items-center gap-2 text-xl font-black"><Code2 className="h-5 w-5 text-ink" aria-hidden="true" /><span className="author-name">minhtrong67</span></p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted">{t('withAI')} <Bot className="h-4 w-4 text-ink" aria-hidden="true" /> <strong className="text-fg">Claude</strong></p>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={confirm} title={t('resetTitle')} desc={t('resetDesc')} confirmLabel={t('reset')} confirmIcon={RotateCcw} onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onReset() }} />
    </>
  )
}
