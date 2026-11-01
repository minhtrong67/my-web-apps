import { memo } from 'react'
import { useSettings } from '../lib/app-context.jsx'
import { fullName } from '../lib/students.js'
import { CopyButton, FavButton } from './Actions.jsx'
import { Portrait, Stars, StudentTags, Tag } from './ui.jsx'

const open = (fn, s) => (e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fn(s) } }

/* ───────── Thẻ (lưới) ─────────
   Ảnh sạch: không có huy hiệu / nút nào đè lên. Sao + nút yêu thích + sao chép nằm ở chân thẻ. */
export const StudentCard = memo(function StudentCard({ s, fav, onOpen, onFav, index }) {
  return (
    <div className="-mx-2 -mt-2 -mb-5 px-2 pb-5 pt-2 [contain-intrinsic-size:auto_410px] [content-visibility:auto]">
    <article
      role="button" tabIndex={0} aria-label={s.name}
      onClick={() => onOpen(s)} onKeyDown={open(onOpen, s)}
      style={{ animationDelay: `${Math.min(index, 16) * 26}ms` }}
      className="group relative flex h-full animate-rise cursor-pointer flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-low shadow-[0_2px_0_var(--ba-outline-variant)] transition-[transform,box-shadow,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-primary hover:shadow-[0_3px_0_var(--ba-primary),0_16px_30px_-16px_rgb(0_0_0/0.4)] active:translate-y-0"
    >
      <span className="absolute left-0 top-0 z-10 h-full w-1 origin-top scale-y-0 bg-primary transition-transform duration-300 ease-smooth group-hover:scale-y-100" />
      <Portrait s={s} w={200} className="stripes cut-bl aspect-[4/4.4] bg-surface-high" imgClass="transition-transform duration-500 ease-smooth group-hover:scale-105" />
      <div className="flex min-w-0 flex-1 flex-col px-3 pb-2 pt-2">
        <h3 className="truncate text-[1.05rem] font-extrabold italic leading-tight" title={s.name}>{s.name}</h3>
        <p className="mt-0.5 truncate text-[0.86rem] font-bold text-primary">{fullName(s)}</p>
        <p className="mt-1 truncate text-xs text-on-surface-variant">{s.schoolL} · {s.weaponL}</p>
        <div className="mt-2.5 flex flex-wrap gap-1"><StudentTags s={s} /></div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-dashed border-outline-variant px-3 py-2">
        <Stars n={s.rarity} />
        <div className="flex items-center gap-1.5">
          <FavButton on={fav} onToggle={() => onFav(s)} />
          <CopyButton s={s} />
        </div>
      </div>
    </article>
    </div>
  )
})

/* ───────── Hàng (danh sách) ───────── */
export const ROW_COLS = 'grid-cols-[56px_minmax(0,1fr)_auto] md:grid-cols-[56px_minmax(0,1.5fr)_84px_1fr_0.8fr_0.7fr_110px_96px_64px_auto]'

export const ListHeader = () => {
  const { t } = useSettings()
  return (
    <div className={`slant sticky top-[72px] z-10 hidden items-center gap-3 bg-primary px-5 py-2 text-xs font-bold uppercase italic tracking-wider text-on-primary [--s:14px] md:grid ${ROW_COLS}`}>
      <span /><span>{t('l.name')}</span><span>{t('l.rarity')}</span><span>{t('l.school')}</span><span>{t('l.role')}</span><span>{t('l.pos')}</span><span>{t('l.atk')}</span><span>{t('l.arm')}</span><span>{t('l.weapon')}</span><span className="w-[84px]" />
    </div>
  )
}

export const StudentRow = memo(function StudentRow({ s, fav, onOpen, onFav, index }) {
  return (
    <div
      role="button" tabIndex={0} aria-label={s.name}
      onClick={() => onOpen(s)} onKeyDown={open(onOpen, s)}
      style={{ animationDelay: `${Math.min(index, 20) * 16}ms` }}
      className={`group relative grid animate-rise cursor-pointer items-center gap-3 overflow-hidden rounded-md border border-outline-variant bg-surface-low p-2 pr-3 transition-[background-color,border-color,box-shadow] duration-200 ease-smooth hover:border-primary hover:bg-surface-mid hover:shadow-md ${ROW_COLS}`}
    >
      <span className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />
      <Portrait s={s} w={64} className="stripes slant size-14 bg-surface-high [--s:8px]" />
      <div className="min-w-0">
        <b className="block truncate font-extrabold italic" title={s.name}>{s.name}</b>
        <span className="block truncate text-sm font-bold text-primary">{fullName(s)}</span>
        <span className="block truncate text-xs text-on-surface-variant md:hidden">{s.schoolL} · {s.roleL} · {s.weaponL}</span>
      </div>
      <span className="hidden md:block"><Stars n={s.rarity} /></span>
      <span className="hidden truncate text-sm md:block">{s.schoolL}</span>
      <span className="hidden truncate text-sm md:block">{s.roleL}</span>
      <span className="hidden truncate text-sm md:block">{s.posL}</span>
      <span className="hidden md:block"><Tag kind={s.atk}>{s.atkL}</Tag></span>
      <span className="hidden md:block"><Tag kind={s.arm}>{s.armL}</Tag></span>
      <span className="hidden truncate text-sm md:block">{s.weaponL}</span>
      <div className="flex items-center gap-1">
        <FavButton on={fav} onToggle={() => onFav(s)} variant="icon" />
        <CopyButton s={s} variant="icon" />
      </div>
    </div>
  )
})
