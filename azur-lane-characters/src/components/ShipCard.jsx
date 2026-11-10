import { memo, useState } from 'react'
import { Check, ChevronRight, Copy, Ship as ShipIcon, Star } from 'lucide-react'
import { RAR } from '../lib/data.js'
import { useI18n } from '../lib/i18n.jsx'
import { IconBtn, cx } from './UI.jsx'

export function Thumb({ src, alt, className }) {
  const [st, setSt] = useState('load')
  return (
    <div className={cx('relative overflow-hidden bg-surf2', className)}>
      {st !== 'ok' && (
        <div className={cx('absolute inset-0 grid place-items-center', st === 'load' && 'skeleton')}>
          {st === 'err' && <ShipIcon className="h-8 w-8 text-muted/60" aria-hidden="true" />}
        </div>
      )}
      {st !== 'err' && (
        <img
          src={src} alt={alt} loading="lazy" decoding="async"
          onLoad={() => setSt('ok')} onError={() => setSt('err')}
          className={cx('h-full w-full object-cover object-top transition duration-500 group-hover:scale-110', st === 'ok' ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  )
}

function CopyBtn({ s, onCopy }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  const run = async (e) => {
    e.stopPropagation()
    if (await onCopy(s)) { setDone(true); setTimeout(() => setDone(false), 1400) }
  }
  return (
    <IconBtn
      label={t('copyName')} icon={done ? Check : Copy} onClick={run} onKeyDown={(e) => e.stopPropagation()}
      className={cx('!h-8 !w-8 border-line', done && '!border-emerald-500/50 !bg-emerald-500/15 !text-emerald-500')}
    />
  )
}

export const ShipCard = memo(function ShipCard({ s, view, i, onOpen, onCopy }) {
  const { t, tv } = useI18n()
  const rar = RAR[s.r] || RAR.Normal
  const style = { '--rc': rar.c, '--rg': rar.g || rar.c, animationDelay: `${Math.min(i % 24, 12) * 28}ms` }
  const key = (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(s) }
  }
  const common = { role: 'button', tabIndex: 0, 'aria-label': `${t('details')}: ${s.n.en}`, onClick: () => onOpen(s), onKeyDown: key, style }

  if (view === 'list') {
    const sub = [s.n.jp, s.n.cn].find((x) => x && x !== s.n.en)
    return (
      <article {...common} className="card card-row group anim-up flex-row items-stretch">
        <div className="w-1 shrink-0" style={{ background: 'var(--rg)' }} />
        <Thumb src={s.thumb} alt={s.n.en} className="aspect-[3/4] w-16 shrink-0 sm:w-20" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold sm:text-base">{s.n.en}</h3>
            {sub && <p className="truncate text-xs text-muted">{sub}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-bold" style={{ color: rar.c }}><Star className="h-3 w-3 fill-current" aria-hidden="true" />{s.st} · {tv('rarity', s.r)}</span>
            <span className="text-muted">{tv('hull', s.hull)}</span>
            <span className="text-ink">{tv('nat', s.nat)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 pr-3">
          <CopyBtn s={s} onCopy={onCopy} />
          <ChevronRight className="hidden h-4 w-4 text-muted sm:block" aria-hidden="true" />
        </div>
      </article>
    )
  }

  return (
    <article {...common} className="card group anim-up flex-col">
      <div className="rar-bar" />
      <div className="relative">
        <Thumb src={s.thumb} alt={s.n.en} className="aspect-[3/4]" />
        <span className="badge absolute left-2 top-2"><Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />{s.st}</span>
        <span className="badge absolute right-2 top-2" style={{ color: rar.c }}>{tv('rarity', s.r)}</span>
        <div className="shine" />
      </div>
      <div className="flex items-start gap-1.5 p-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold leading-tight">{s.n.en}</h3>
          <p className="mt-0.5 truncate text-xs text-muted">{tv('hull', s.hull)}</p>
          <p className="truncate text-xs text-ink">{tv('nat', s.nat)}</p>
        </div>
        <CopyBtn s={s} onCopy={onCopy} />
      </div>
    </article>
  )
})
