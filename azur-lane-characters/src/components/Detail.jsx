import { useState } from 'react'
import { Copy, ExternalLink, Ship as ShipIcon, Star, X } from 'lucide-react'
import { RAR, STAT_KEYS, STAT_MAX, STAT_SHOW } from '../lib/data.js'
import { useI18n } from '../lib/i18n.jsx'
import { Btn, Modal, Segmented, cx } from './UI.jsx'

function Body({ s }) {
  const { t, tv } = useI18n()
  const [tab, setTab] = useState(2)
  const [art, setArt] = useState(false)
  const rar = RAR[s.r] || RAR.Normal
  const vals = s.s[tab] || s.s[2] || s.s[1] || s.s[0]
  const names = [['EN', s.n.en], ['CN', s.n.cn], ['JP', s.n.jp], ['KR', s.n.kr], ['Code', s.n.code]].filter(([, v], i, a) => v && a.findIndex(([, x]) => x === v) === i)
  const info = [
    [t('id'), s.id], [t('class'), s.cls], [t('build'), s.ct], [t('artist'), s.artist], [t('voice'), s.va]
  ].filter(([, v]) => v)

  return (
    <div className="grid gap-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
      <div className="space-y-3">
        <div
          className="relative mx-auto aspect-[3/4] w-full max-w-[13rem] overflow-hidden rounded-md border-2 bg-gradient-to-b from-surf2 to-surf sm:max-w-none"
          style={{ borderColor: rar.c, boxShadow: `0 10px 30px -14px ${rar.c}` }}
        >
          <ShipIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-muted/40" aria-hidden="true" />
          <img src={s.thumb} alt="" className={cx('absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500', art ? 'opacity-0' : 'opacity-100')} />
          {s.artUrl && (
            <img src={s.artUrl} alt={s.n.en} loading="lazy" onLoad={() => setArt(true)} className={cx('absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700', art ? 'opacity-100' : 'opacity-0')} />
          )}
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: rar.g || rar.c }} />
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        <div>
          <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{s.n.en}</h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-black" style={{ background: rar.g || rar.c }}>
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />{s.st} · {tv('rarity', s.r)}
            </span>
            <span className="rounded border border-line bg-surf2 px-2 py-1">{tv('hull', s.hull)}</span>
            <span className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-ink">{tv('nat', s.nat)}</span>
          </div>
        </div>

        <section>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink">{t('names')}</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {names.map(([k, v]) => (
              <div key={k} className="min-w-0"><dt className="text-[11px] font-semibold text-muted">{k}</dt><dd className="truncate font-medium" title={v}>{v}</dd></div>
            ))}
          </dl>
        </section>

        {info.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink">{t('info')}</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {info.map(([k, v]) => (
                <div key={k} className="min-w-0"><dt className="text-[11px] font-semibold text-muted">{k}</dt><dd className="truncate font-medium" title={v}>{v}</dd></div>
              ))}
            </dl>
          </section>
        )}

        {vals && (
          <section>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink">{t('stats')}</h4>
              <div className="w-56 max-w-[60%]">
                <Segmented label={t('stats')} value={tab} onChange={setTab} options={[{ value: 0, label: t('lv1') }, { value: 1, label: t('lv100') }, { value: 2, label: t('lv120') }].filter((o) => s.s[o.value])} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STAT_SHOW.map((j) => {
                const n = parseFloat(vals[j])
                const pct = STAT_MAX[tab][j] ? Math.min(100, ((isNaN(n) ? 0 : n) / STAT_MAX[tab][j]) * 100) : 0
                return (
                  <div key={j} className="rounded border border-line bg-surf2/60 px-2.5 py-2">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate text-muted">{t('st_' + STAT_KEYS[j])}</span>
                      <b className="text-sm tabular-nums">{vals[j] === '' ? '–' : vals[j]}</b>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="rounded border border-line bg-surf2/60 px-2.5 py-2 text-xs">
                <span className="text-muted">{t('st_armor')}</span>
                <div className="mt-0.5 text-sm font-bold">{vals[1] || '–'}</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export function Detail({ s, open, onClose, onCopy }) {
  const { t } = useI18n()
  if (!s) return null
  return (
    <Modal
      open={open} onClose={onClose} title={s.n.en} icon={ShipIcon} size="lg"
      footer={<>
        <Btn tone="neutral" icon={X} onClick={onClose}>{t('close')}</Btn>
        {s.wiki && <Btn tone="info" icon={ExternalLink} onClick={() => window.open(s.wiki, '_blank', 'noopener,noreferrer')}>{t('wiki')}</Btn>}
        <Btn tone="primary" icon={Copy} onClick={() => onCopy(s)}>{t('copyName')}</Btn>
      </>}
    >
      <Body key={s.id} s={s} />
    </Modal>
  )
}
