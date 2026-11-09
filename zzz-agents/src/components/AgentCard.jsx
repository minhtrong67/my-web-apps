import { memo, useEffect, useState } from 'react'
import { ELEMENTS } from '../data.js'
import { useSettings } from '../settings.jsx'
import { IconBtn } from './Btn.jsx'

const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')

export function Portrait({ a, className = '', big }) {
  const srcs = [a.image, a.imageAlt].filter(Boolean)
  const [k, setK] = useState(0)
  const [ok, setOk] = useState(false)
  useEffect(() => { setK(0); setOk(false) }, [a.id])
  const src = srcs[k]
  const c = ELEMENTS[a.element]
  return (
    <div className={`relative overflow-hidden ${src ? '' : 'stripes'} ${className}`} style={{ background: `linear-gradient(135deg, ${c}66, transparent 75%)` }}>
      {src ? (
        <>
          {!ok && <div className="sk absolute inset-0" />}
          <img key={src} src={src} alt={a.name} loading="lazy" decoding="async"
            ref={(el) => { if (el?.complete && el.naturalWidth) setOk(true) }}
            onLoad={() => setOk(true)} onError={() => { setOk(false); setK((x) => x + 1) }}
            className={`h-full w-full object-cover object-top transition-[opacity,transform] duration-500 group-hover:scale-105 ${ok ? 'opacity-100' : 'opacity-0'}`} />
        </>
      ) : <span className="absolute inset-0 grid place-items-center font-black italic opacity-80" style={{ color: c, fontSize: big ? '4rem' : '1.5rem' }}>{initials(a.name)}</span>}
      <span className={`absolute left-0 top-0 px-2 py-0.5 font-mono text-xs font-black ${a.rarity === 'S' ? 'bg-p text-onp' : 'bg-fg text-bg'}`}>{a.rarity}</span>
    </div>
  )
}

function AgentCard({ a, view, i, onOpen, onCopy, fav, onFav }) {
  const { t } = useSettings()
  const c = ELEMENTS[a.element]
  const list = view === 'list'
  return (
    <article style={{ animationDelay: i < 12 ? `${i * 30}ms` : undefined, containIntrinsicSize: list ? 'auto 84px' : 'auto 360px' }}
      className={`card ${i < 12 ? 'pop' : ''} cut shine group relative flex border border-line bg-surface transition-[transform,border-color] duration-200 focus-within:border-p hover:-translate-y-1 hover:border-p ${list ? 'items-center gap-3 p-2 pr-3' : 'flex-col'}`}>
      <span className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-1" style={{ background: c }} />
      <Portrait a={a} className={list ? 'h-16 w-16 shrink-0' : 'aspect-[4/5] w-full'} />
      <div className={`min-w-0 flex-1 ${list ? 'flex items-center gap-2' : 'flex flex-col p-2.5 pl-3.5 sm:p-3 sm:pl-4'}`}>
        <div className="min-w-0 flex-1">
          {/* nút mở chi tiết phủ toàn card (stretched button) — không lồng nút trong nút */}
          <h3 className="min-w-0 text-base font-extrabold uppercase italic leading-tight sm:text-lg">
            <button type="button" onClick={() => onOpen(a)} aria-label={`${t('details')}: ${a.name}`}
              className="block max-w-full cursor-pointer truncate text-left uppercase italic after:absolute after:inset-0 after:z-10 after:content-['']">{a.name}</button>
          </h3>
          <div className="mt-2 flex flex-wrap gap-1 text-xs font-bold">
            <span className="cut-sm px-2 py-0.5 text-black" style={{ background: c }}>{t(a.element)}</span>
            <span className="cut-sm border border-line px-2 py-0.5">{t(a.specialty)}</span>
          </div>
        </div>
        <div className={`relative z-20 flex shrink-0 gap-1 ${list ? '' : 'mt-auto justify-end pt-2'}`}>
          <IconBtn icon="heart" fill={fav} active={fav} label={fav ? t('unfav') : t('fav')} onClick={() => onFav(a.id)} className="!p-1.5" />
          <IconBtn icon="copy" label={t('copy')} onClick={() => onCopy(a)} className="!p-1.5" />
        </div>
      </div>
    </article>
  )
}
export default memo(AgentCard)
