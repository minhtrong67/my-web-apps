import { memo, useState } from 'react'
import { BadgeCheck, Check, ChevronRight, Copy, Heart, Ship as ShipIcon, Star } from 'lucide-react'
import { RAR } from '../lib/data.js'
import { rangeOf } from '../lib/search.js'
import { useI18n } from '../lib/i18n.jsx'
import { IconBtn, cx } from './UI.jsx'

/** <img> that walks through fallback URLs (GitHub raw -> jsDelivr) before giving up. */
export function Img({ srcs, onFail, ...p }) {
  const [i, setI] = useState(0)
  return <img key={i} src={srcs[i]} onError={() => (i < srcs.length - 1 ? setI(i + 1) : onFail?.())} {...p} />
}

export function Thumb({ srcs, alt, className }) {
  const [st, setSt] = useState('load')
  return (
    <div className={cx('relative overflow-hidden bg-surf2', className)}>
      {st !== 'ok' && (
        <div className={cx('absolute inset-0 grid place-items-center', st === 'load' && 'skeleton')}>
          {st === 'err' && <ShipIcon className="h-8 w-8 text-muted/60" aria-hidden="true" />}
        </div>
      )}
      {st !== 'err' && (
        <Img
          srcs={srcs} alt={alt} loading="lazy" decoding="async" onLoad={() => setSt('ok')} onFail={() => setSt('err')}
          className={cx('h-full w-full object-cover object-top transition duration-700 group-hover:scale-110', st === 'ok' ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-lg')}
        />
      )}
    </div>
  )
}

function Hl({ text, hl }) {
  const r = hl?.length ? rangeOf(text, hl) : null
  if (!r) return text
  return <>{text.slice(0, r[0])}<mark className="hl">{text.slice(r[0], r[1])}</mark>{text.slice(r[1])}</>
}

function Actions({ s, fav, own, onCopy, onFav, onOwn, className }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const stop = { onKeyDown: (e) => e.stopPropagation() }
  const copy = async (e) => { e.stopPropagation(); if (await onCopy(s)) { setDone(true); setTimeout(() => setDone(false), 1400) } }
  return (
    <div className={cx('flex items-center gap-1', className)}>
      <IconBtn label={t('copyName')} icon={done ? Check : Copy} onClick={copy} {...stop} className={cx('!h-8 !w-8', done && '!border-emerald-500/50 !bg-emerald-500/15 !text-emerald-500')} />
      <IconBtn label={fav ? t('unfav') : t('fav')} icon={Heart} aria-pressed={fav} onClick={(e) => { e.stopPropagation(); onFav(s) }} {...stop} iconClass={fav && 'fill-current'} className={cx('!h-8 !w-8', fav && '!text-pink-500')} />
      <IconBtn label={own ? t('unown') : t('own')} icon={BadgeCheck} aria-pressed={own} onClick={(e) => { e.stopPropagation(); onOwn(s) }} {...stop} className={cx('!h-8 !w-8', own && '!text-emerald-500')} />
    </div>
  )
}

export const ShipCard = memo(function ShipCard({ s, view, i, name, hl, fav, own, selMode, selected, onOpen, onCopy, onFav, onOwn }) {
  const { t, tv } = useI18n()
  const rar = RAR[s.r] || RAR.Normal
  const style = { '--rc': rar.c, '--rg': rar.g || rar.c, animationDelay: `${Math.min(i, 12) * 28}ms` }
  const key = (e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(s) } }
  const cls = cx('card group anim-up', rar.rainbow && 'rainbow', selected && 'ring-2 ring-primary')
  const common = { role: 'button', tabIndex: 0, 'aria-label': `${selMode ? t('select') : t('details')}: ${name}`, 'aria-pressed': selMode ? selected : undefined, onClick: () => onOpen(s), onKeyDown: key, style }
  const lv = s.s[2]

  if (view === 'list') {
    const sub = [s.n.en, s.n.jp, s.n.cn].find((x) => x && x !== name)
    return (
      <article {...common} className={cx(cls, 'card-row h-[7.5rem] flex-row items-stretch')}>
        <div className="w-1 shrink-0" style={{ background: 'var(--rg)' }} />
        <Thumb srcs={s.th} alt={name} className="aspect-[3/4] w-16 shrink-0 sm:w-20" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-sm font-bold sm:text-base"><span className="truncate"><Hl text={name} hl={hl} /></span>{own && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />}</h3>
            {sub && <p className="truncate text-xs text-muted">{sub}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-bold" style={{ color: rar.c }}><Star className="h-3 w-3 fill-current" aria-hidden="true" />{s.st} · {tv('rarity', s.r)}</span>
            <span className="text-muted">{tv('hull', s.hull)}</span>
            <span className="text-ink">{tv('nat', s.nat)}</span>
          </div>
          {lv && <p className="hidden text-xs tabular-nums text-muted md:block">{t('st_health')} <b className="text-fg">{lv[0]}</b> · {t('st_firepower')} <b className="text-fg">{lv[4]}</b> · {t('st_torpedo')} <b className="text-fg">{lv[5]}</b> · {t('st_antiair')} <b className="text-fg">{lv[8]}</b></p>}
        </div>
        <div className="flex shrink-0 items-center gap-1 pr-3">
          {selMode ? <span className={cx('grid h-6 w-6 place-items-center rounded-full border-2', selected ? 'border-primary bg-primary text-onp' : 'border-line')}>{selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}</span>
            : <><Actions s={s} fav={fav} own={own} onCopy={onCopy} onFav={onFav} onOwn={onOwn} /><ChevronRight className="hidden h-4 w-4 text-muted sm:block" aria-hidden="true" /></>}
        </div>
      </article>
    )
  }

  return (
    <article {...common} className={cx(cls, 'flex-col')}>
      <div className="rar-bar" />
      <div className="relative">
        <Thumb srcs={s.th} alt={name} className="aspect-[3/4]" />
        <span className="badge absolute left-2 top-2"><Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />{s.st}{own && <BadgeCheck className="h-3 w-3 text-emerald-400" aria-hidden="true" />}</span>
        <span className="badge absolute right-2 top-2" style={{ color: rar.c }}>{tv('rarity', s.r)}</span>
        {selMode && <span className={cx('absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-full border-2 backdrop-blur', selected ? 'border-primary bg-primary text-onp' : 'border-white/80 bg-black/40')}>{selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}</span>}
        <div className="shine" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight"><Hl text={name} hl={hl} /></h3>
          <p className="mt-0.5 truncate text-xs text-muted">{tv('hull', s.hull)}</p>
          <p className="truncate text-xs text-ink">{tv('nat', s.nat)}</p>
        </div>
        {!selMode && <Actions s={s} fav={fav} own={own} onCopy={onCopy} onFav={onFav} onOwn={onOwn} className="mt-auto justify-between border-t border-line pt-2" />}
      </div>
    </article>
  )
})
