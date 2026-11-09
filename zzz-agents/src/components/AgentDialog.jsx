import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import Lightbox from './Lightbox.jsx'
import { Btn } from './Btn.jsx'
import { DetailSkeleton } from './Skeleton.jsx'
import Ic from '../icons.jsx'
import { Portrait } from './AgentCard.jsx'
import { ELEMENTS, fetchDetail, prop, factions } from '../data.js'
import { useSettings } from '../settings.jsx'

const Row = ({ k, v }) => v ? <div className="flex justify-between gap-3 border-b border-line py-1.5 text-sm"><span className="text-muted">{k}</span><span className="text-right font-bold">{v}</span></div> : null
export const clean = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\\n/g, '\n')
export const pretty = (k) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
const H = ({ children }) => <h3 className="mb-1 font-mono text-xs uppercase tracking-widest text-pt">{children}</h3>

export default function AgentDialog({ a, pos, total, neighbors = [], onClose, onCopy, onPrev, onNext, fav, onFav, inCmp, onCmp }) {
  const { t, detailLang } = useSettings()
  const [d, setD] = useState(null)
  const [state, setState] = useState('loading')
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!a) return setZoom(false)
    let live = true
    setD(null); setState('loading')
    fetchDetail(a.id, detailLang).then((x) => live && (setD(x), setState('ok'))).catch(() => live && setState('err'))
    neighbors.forEach((n) => n && fetchDetail(n.id, detailLang).catch(() => {})) // nạp trước agent kế bên
    return () => { live = false }
  }, [a, detailLang]) // eslint-disable-line

  useEffect(() => {
    if (!a || zoom) return
    const k = (e) => { if (e.key === 'ArrowLeft') onPrev(); else if (e.key === 'ArrowRight') onNext() }
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [a, zoom, onPrev, onNext])

  if (!a) return null
  const info = d?.partner_info || {}
  const c = ELEMENTS[a.element]
  const faction = prop(d?.camp) || factions[a.id] || info.race
  const skills = Object.entries(d?.skill || {}).map(([k, s]) => [k, (s?.description || []).filter((x) => x?.name)]).filter(([, items]) => items.length)
  const stats = Object.entries(d?.stats || {}).filter(([, v]) => typeof v === 'number').slice(0, 8)
  const body = clean(info.profile_desc || info.outlook_desc || d?.desc)
  return (
    <>
      <Modal open wide split onClose={onClose} title={a.name}
        footer={<>
          <div className="flex gap-2"><Btn icon="left" variant="ghost" label={t('prev')} onClick={onPrev} /><Btn icon="right" variant="ghost" label={t('next')} onClick={onNext} /></div>
          <div className="flex flex-wrap gap-2">
            <Btn icon="heart" variant="danger" label={fav ? t('unfav') : t('fav')} onClick={() => onFav(a.id)} />
            <Btn icon="compare" variant="success" label={inCmp ? t('compareRemove') : t('compare')} onClick={() => onCmp(a.id)} />
            <Btn icon="copy" variant="info" label={t('copy')} onClick={() => onCopy(a)} />
            <Btn icon="close" variant="neutral" label={t('close')} onClick={onClose} />
          </div>
        </>}>
        <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
          <div className="mx-auto w-full max-w-[12rem] space-y-3 md:max-w-none">
            <button type="button" onClick={() => setZoom(true)} aria-label={t('zoom')} className="group relative block w-full">
              <Portrait a={a} big className="cut aspect-[4/5] w-full" />
              <span className="cut-sm absolute bottom-2 right-2 bg-p p-1.5 text-onp"><Ic n="zoom" className="h-4 w-4" /></span>
            </button>
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              <span className="cut-sm px-2 py-1 text-black" style={{ background: c }}>{t(a.element)}</span>
              <span className="cut-sm border border-line px-2 py-1">{t(a.specialty)}</span>
              {a.attack && <span className="cut-sm border border-line px-2 py-1">{t(a.attack)}</span>}
            </div>
            <p className="font-mono text-[11px] text-muted">{pos > 0 && `${pos} / ${total} · `}{['ja', 'zh', 'ko'].map((l) => a.names?.[l]).filter(Boolean).join(' · ')}</p>
          </div>
          <div className="min-w-0 space-y-4">
            {state === 'loading' && <DetailSkeleton />}
            {state === 'err' && <p className="text-sm text-muted">{a.desc ? clean(a.desc) : t('noDetail')}</p>}
            {state === 'ok' && <>
              <section><H>{t('info')}</H>
                <Row k={t('faction')} v={faction} />
                <Row k="Full name" v={info.full_name} />
                <Row k={t('gender')} v={d.gender === 'F' ? t('female') : d.gender === 'M' ? t('male') : ''} />
                <Row k={t('birthday')} v={info.birthday} />
              </section>
              {body && <section><H>{t('profile')}</H><p className="whitespace-pre-line text-sm leading-relaxed text-muted">{body}</p></section>}
              {stats.length > 0 && <section><H>{t('stats')}</H>
                <div className="grid gap-x-4 sm:grid-cols-2">{stats.map(([k, v]) => <Row key={k} k={pretty(k)} v={Math.round(v * 100) / 100} />)}</div>
              </section>}
              {skills.length > 0 && <section><H>{t('skillsDetail')}</H>
                {skills.map(([k, items]) => (
                  <details key={k} className="border-b border-line py-1.5 text-sm">
                    <summary className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="capitalize text-muted">{pretty(k)}</span><span className="text-right font-bold">{clean(items[0].name)}</span>
                    </summary>
                    <div className="mt-2 space-y-2 text-muted">
                      {items.map((it, i) => <div key={i}><p className="font-bold text-fg">{clean(it.name)}</p>{it.desc && <p className="whitespace-pre-line">{clean(it.desc)}</p>}</div>)}
                    </div>
                  </details>
                ))}
              </section>}
            </>}
          </div>
        </div>
      </Modal>
      {zoom && <Lightbox a={a} pos={pos} total={total} onClose={() => setZoom(false)} onPrev={onPrev} onNext={onNext} />}
    </>
  )
}
