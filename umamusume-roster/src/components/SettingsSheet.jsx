import { useState } from 'react';
import { Check, Heart, Languages, Monitor, Moon, Palette, RotateCcw, Settings, Sparkles, Sun, Trash2, Type, ALargeSmall, Bot, Download, Zap } from 'lucide-react';
import { COLORS, FONTS, useSettings } from '../lib/settings';
import { Sheet, ConfirmDialog } from './Overlay';
import { Button, Segmented } from './ui';
import Select from './Select';
import Tooltip from './Tooltip';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-extrabold"><Icon className="size-4 text-accent" aria-hidden />{title}</h3>
      {children}
    </section>
  );
}

export default function SettingsSheet({ open, onClose, favCount, onClearFavs, onToast, onExport }) {
  const { t, settings, set, reset } = useSettings();
  const [confirm, setConfirm] = useState(null);

  const fonts = FONTS.map((f) => ({ value: f.id, label: f.label ?? t('f_system'), style: { fontFamily: f.stack } }));

  return (
    <>
      <Sheet open={open} onClose={onClose} title={t('settings')} icon={Settings}>
        <Section icon={Sun} title={t('themeMode')}>
          <Segmented
            label={t('themeMode')}
            value={settings.mode}
            onChange={(mode) => set({ mode })}
            options={[
              { value: 'light', label: t('light'), icon: Sun },
              { value: 'dark', label: t('dark'), icon: Moon },
              { value: 'system', label: t('system'), icon: Monitor }
            ]}
          />
        </Section>

        <Section icon={Palette} title={t('themeColor')}>
          <div role="radiogroup" aria-label={t('themeColor')} className="grid grid-cols-12 gap-2">
            {COLORS.map((c, i) => {
              const on = settings.color === c.id;
              const light = parseInt(c.hex.slice(1, 3), 16) * 0.3 + parseInt(c.hex.slice(3, 5), 16) * 0.6 + parseInt(c.hex.slice(5, 7), 16) * 0.1 > 150;
              return (
                <div key={c.id} className={i < 16 ? 'col-span-3' : 'col-span-4'}>
                  <Tooltip label={t(`c_${c.id}`)} className="w-full">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={t(`c_${c.id}`)}
                      onClick={() => set({ color: c.id })}
                      className={`grid h-11 w-full place-items-center rounded-xl border-2 transition hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${on ? 'border-ink shadow-lg' : 'border-transparent'}`}
                      style={{ background: c.hex, color: light ? '#1b1b1b' : '#fff' }}
                    >
                      {on && <Check className="size-5 check-pop" strokeWidth={3} aria-hidden />}
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </Section>

        <Section icon={ALargeSmall} title={t('fontSize')}>
          <Segmented
            label={t('fontSize')}
            value={settings.size}
            onChange={(size) => set({ size })}
            options={[
              { value: 'small', label: t('small') },
              { value: 'medium', label: t('medium') },
              { value: 'large', label: t('large') }
            ]}
          />
        </Section>

        <Section icon={Languages} title={t('language')}>
          <Segmented
            label={t('language')}
            value={settings.lang}
            onChange={(lang) => set({ lang })}
            options={[{ value: 'en', label: 'English' }, { value: 'vi', label: 'Tiếng Việt' }]}
          />
        </Section>

        <Section icon={Zap} title={t('motion')}>
          <Segmented label={t('motion')} value={settings.motion} onChange={(motion) => set({ motion })} options={[{ value: 'on', label: t('motionOn') }, { value: 'off', label: t('motionOff') }]} />
        </Section>

        <Section icon={Type} title={t('font')}>
          <Select label={t('font')} value={settings.font} onChange={(font) => set({ font })} options={fonts} />
        </Section>

        <Section icon={Heart} title={t('data')}>
          <div className="flex flex-col gap-2">
            <Button variant="info" icon={Download} onClick={onExport}>{t('exportList')}</Button>
            <Button variant="danger" icon={Trash2} disabled={!favCount} onClick={() => setConfirm('favs')}>{t('clearFavs')}</Button>
            <Button variant="neutral" icon={RotateCcw} onClick={() => setConfirm('reset')}>{t('resetSettings')}</Button>
          </div>
        </Section>

        <section
          className="relative mt-8 overflow-hidden rounded-2xl p-4 text-on-primary"
          style={{ background: 'linear-gradient(130deg, var(--p), color-mix(in oklab, var(--p) 55%, #000))' }}
        >
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-85"><Sparkles className="size-3.5" aria-hidden />{t('author')}</p>
          <p className="mt-1.5 text-sm font-medium opacity-95">{t('madeBy')}</p>
          <p className="text-xl font-black italic tracking-tight">minhtrong67</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium opacity-95"><Bot className="size-4" aria-hidden />{t('withAI')} <b className="font-extrabold">Claude</b></p>
        </section>
      </Sheet>

      <ConfirmDialog
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        icon={RotateCcw}
        variant="danger"
        confirmIcon={RotateCcw}
        title={t('resetTitle')}
        message={t('resetMsg')}
        confirmLabel={t('confirm')}
        onConfirm={() => { reset(); onToast({ variant: 'success', message: t('resetDone') }); }}
      />
      <ConfirmDialog
        open={confirm === 'favs'}
        onClose={() => setConfirm(null)}
        icon={Trash2}
        variant="danger"
        confirmIcon={Trash2}
        title={t('clearFavsTitle')}
        message={t('clearFavsMsg', { n: favCount })}
        confirmLabel={t('clear')}
        onConfirm={() => { onClearFavs(); onToast({ variant: 'success', message: t('favsCleared') }); }}
      />
    </>
  );
}
