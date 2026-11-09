import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { Btn } from './Btn.jsx'
import { Sk } from './Skeleton.jsx'
import { Portrait } from './AgentCard.jsx'
import { pretty } from './AgentDialog.jsx'
import { fetchDetail, prop, factions } from '../data.js'
import { useSettings } from '../settings.jsx'

export default function CompareDialog({ list, onClose }) {
  const { t, detailLang } = useSettings()
  const [det, setDet] = useState({})
  const key = list.map((a) => a.id).join()
  useEffect(() => {
    list.forEach((a) => fetchDetail(a.id, detailLang).then((d) => setDet((p) => ({ ...p, [a.id]: d }))).catch(() => {}))
  }, [key, detailLang]) // eslint-disable-line
  const [A, B] = list
  const st = (a) => det[a.id]?.stats || {}
  const keys = [...new Set([...Object.keys(st(A)), ...Object.keys(st(B))])].filter((k) => typeof st(A)[k] === 'number' || typeof st(B)[k] === 'number').slice(0, 10)
  const loading = !det[A.id] || !det[B.id]
  const fac = (a) => prop(det[a.id]?.camp) || factions[a.id] || '–'
  const rows = [
    [t('element'), t(A.element), t(B.element)], [t('specialty'), t(A.specialty), t(B.specialty)], [t('rarity'), A.rarity, B.rarity],
    [t('attack'), A.attack ? t(A.attack) : '–', B.attack ? t(B.attack) : '–'], [t('faction'), fac(A), fac(B)]
  ]
  const cell = 'border-b border-line py-2 text-sm'
  return (
    <Modal open wide onClose={onClose} title={t('compareTitle')} footer={<Btn icon="close" variant="neutral" label={t('close')} onClick={onClose} />}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-x-3">
        {[A, B].map((a, i) => (
          <div key={a.id} className={`space-y-2 ${i ? 'col-start-3 row-start-1' : ''}`}>
            <Portrait a={a} className="cut mx-auto aspect-[4/5] w-full max-w-[9rem]" />
            <p className="truncate text-center font-extrabold uppercase italic">{a.name}</p>
          </div>
        ))}
        <span className="col-start-2 row-start-1 pb-8 font-mono text-sm font-black text-pt">VS</span>
        {rows.map(([l, x, y]) => <Row3 key={l} l={l} x={x} y={y} cell={cell} />)}
        {loading ? [0, 1, 2, 3].map((i) => <div key={i} className="col-span-3 py-2"><Sk className="h-4 w-full" /></div>)
          : keys.map((k) => {
            const x = st(A)[k], y = st(B)[k]
            return <Row3 key={k} l={pretty(k)} x={x ?? '–'} y={y ?? '–'} cell={cell} win={x > y ? 0 : y > x ? 1 : -1} />
          })}
      </div>
    </Modal>
  )
}

function Row3({ l, x, y, cell, win = -1 }) {
  const f = (v, i) => <span className={win === i ? 'font-black text-pt' : 'font-bold'}>{typeof v === 'number' ? Math.round(v * 100) / 100 : v}</span>
  return (
    <>
      <div className={`${cell} text-right`}>{f(x, 0)}</div>
      <div className={`${cell} px-2 text-center font-mono text-[11px] uppercase text-muted`}>{l}</div>
      <div className={cell}>{f(y, 1)}</div>
    </>
  )
}
