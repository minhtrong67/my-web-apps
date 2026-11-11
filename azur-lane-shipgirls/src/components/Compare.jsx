import { useRef, useState } from 'react'
import { GitCompareArrows, X } from 'lucide-react'
import { RAR, STAT_KEYS, STAT_SHOW, useData } from '../lib/data.js'
import { useI18n } from '../lib/i18n.jsx'
import { Btn, Modal, Segmented, cx } from './UI.jsx'
import { Thumb } from './ShipCard.jsx'
import { Radar, radarPct } from './Radar.jsx'

const COLORS = ['#38bdf8', '#f472b6', '#facc15']

export function Compare({ open, onClose, ships, nameKey }) {
  const { t, tv } = useI18n()
  const { STAT_REF } = useData()
  const [lv, setLv] = useState(2)
  const last = useRef([])
  if (ships.length) last.current = ships
  const list = ships.length ? ships : last.current
  const n = list.length
  const cols = { gridTemplateColumns: `6.5rem repeat(${n}, minmax(8rem, 1fr))` }
  const val = (s, j) => parseFloat((s.s[lv] || s.s[2] || s.s[1] || s.s[0])?.[j])

  return (
    <Modal open={open} onClose={onClose} title={t('compareTitle')} icon={GitCompareArrows} size="lg" footer={<Btn tone="neutral" icon={X} onClick={onClose}>{t('close')}</Btn>}>
      {n > 0 && (
        <div className="space-y-4">
          <div className="ml-auto w-56 max-w-full">
            <Segmented label={t('stats')} value={lv} onChange={setLv} options={[{ value: 0, label: t('lv1') }, { value: 1, label: t('lv100') }, { value: 2, label: t('lv120') }]} />
          </div>
          <Radar size={260} series={list.map((s, i) => ({ pct: radarPct(s, lv, STAT_REF), color: COLORS[i] }))} />
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="grid gap-2 pb-3" style={cols}>
                <div />
                {list.map((s, i) => {
                  const rar = RAR[s.r] || RAR.Normal
                  return (
                    <div key={s.id} className="min-w-0 rounded border border-line bg-surf2/50 p-2" style={{ borderTop: `3px solid ${COLORS[i]}` }}>
                      <Thumb srcs={s.th} alt="" className="mx-auto aspect-[3/4] w-16 rounded" />
                      <p className="mt-2 truncate text-center text-sm font-bold" title={s.n[nameKey] || s.n.en}>{s.n[nameKey] || s.n.en}</p>
                      <p className="truncate text-center text-[11px] font-semibold" style={{ color: rar.c }}>{s.st}★ {tv('rarity', s.r)}</p>
                      <p className="truncate text-center text-[11px] text-muted">{tv('hull', s.hull)}</p>
                      <p className="truncate text-center text-[11px] text-ink">{tv('nat', s.nat)}</p>
                    </div>
                  )
                })}
              </div>
              {STAT_SHOW.map((j) => {
                const vs = list.map((s) => val(s, j))
                const ok = vs.filter((v) => !isNaN(v))
                const best = ok.length > 1 ? (j === 10 ? Math.min(...ok) : Math.max(...ok)) : null
                return (
                  <div key={j} className="grid items-center gap-2 border-t border-line py-2 text-sm" style={cols}>
                    <span className="text-xs font-semibold text-muted">{t('st_' + STAT_KEYS[j])}</span>
                    {vs.map((v, i) => <span key={i} className={cx('text-center tabular-nums', best !== null && v === best && vs.filter((x) => x === best).length < n ? 'font-black text-emerald-500' : '')}>{isNaN(v) ? '–' : v}</span>)}
                  </div>
                )
              })}
              <div className="grid items-center gap-2 border-t border-line py-2 text-sm" style={cols}>
                <span className="text-xs font-semibold text-muted">{t('st_armor')}</span>
                {list.map((s) => <span key={s.id} className="text-center">{(s.s[lv] || s.s[2] || [])[1] || '–'}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
