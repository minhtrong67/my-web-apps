import { useState } from 'react'
import { Bot, Check, Code2, Database, Languages, Monitor, Moon, Palette, RotateCcw, Settings as Cog, Sparkles, Sun, Type, TextCursorInput } from 'lucide-react'
import { COLORS, FONTS, onColor } from '../lib/theme.js'
import { useI18n } from '../lib/i18n.jsx'
import { Btn, ConfirmDialog, Modal, Segmented, Select, Tooltip } from './UI.jsx'

function Section({ icon: Icon, title, children }) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink"><Icon className="h-4 w-4" aria-hidden="true" />{title}</h3>
      {children}
    </section>
  )
}

export function SettingsSheet({ open, onClose, st, set, onReset }) {
  const { t } = useI18n()
  const [confirm, setConfirm] = useState(false)
  const fontOptions = Object.keys(FONTS).map((k) => ({ value: k, label: k === 'System' ? t('system') : k, fontFamily: FONTS[k] }))

  return (
    <>
      <Modal
        sheet open={open} onClose={onClose} title={t('settings')} icon={Cog}
        footer={<Btn tone="primary" icon={Check} onClick={onClose}>{t('done')}</Btn>}
      >
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
            <Segmented label={t('fontSize')} value={st.size} onChange={(v) => set('size', v)} options={[
              { value: 'sm', label: t('small') }, { value: 'md', label: t('medium') }, { value: 'lg', label: t('large') }
            ]} />
          </Section>

          <Section icon={Languages} title={t('language')}>
            <Segmented label={t('language')} value={st.lang} onChange={(v) => set('lang', v)} options={[
              { value: 'en', label: 'English' }, { value: 'vi', label: 'Tiếng Việt' }
            ]} />
          </Section>

          <Section icon={Type} title={t('font')}>
            <Select label={t('font')} icon={Type} value={st.font} onChange={(v) => set('font', v)} options={fontOptions} />
          </Section>

          <Section icon={Database} title={t('data')}>
            <p className="text-sm leading-relaxed text-muted">{t('dataDesc')}</p>
          </Section>

          <Btn tone="danger" icon={RotateCcw} className="w-full" onClick={() => setConfirm(true)}>{t('resetSettings')}</Btn>

          <div className="author">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink"><Sparkles className="h-4 w-4" aria-hidden="true" />{t('author')}</div>
            <p className="mt-2 flex items-center gap-2 text-xl font-black"><Code2 className="h-5 w-5 text-ink" aria-hidden="true" /><span className="author-name">minhtrong67</span></p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {t('withAI')} <Bot className="h-4 w-4 text-ink" aria-hidden="true" /> <strong className="text-fg">Claude</strong>
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm} title={t('resetTitle')} desc={t('resetDesc')} confirmLabel={t('reset')} confirmIcon={RotateCcw}
        onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onReset() }}
      />
    </>
  )
}
