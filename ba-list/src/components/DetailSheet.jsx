import { useEffect, useRef } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Layers, Palette, Swords, UserRound, X } from 'lucide-react'
import { useSettings } from '../lib/app-context.jsx'
import { STUDENTS, cap, fmtDate, fullName } from '../lib/students.js'
import { CopyButton, FavButton } from './Actions.jsx'
import Sheet from './Sheet.jsx'
import { IconButton, Portrait, Stars, StudentTags, TitleTab, cx } from './ui.jsx'

const GRADE_COLOR = { S: '#f0a800', A: '#f2702e', B: '#2fb86e', C: '#2b8be0', D: '#8791a5' }

function Section({ icon, title, children, i = 0 }) {
  return (
    <section style={{ animationDelay: `${i * 60}ms` }} className="animate-rise rounded-md border border-outline-variant bg-surface-mid p-4 pt-3">
      <TitleTab icon={icon}>{title}</TitleTab>
      {children}
    </section>
  )
}

function Rows({ rows }) {
  const r = rows.filter(([, v]) => v !== '' && v != null && v !== false)
  return (
    <dl className="grid grid-cols-[auto_1fr] text-[0.93rem]">
      {r.map(([k, v], i) => (
        <div key={k} className={cx('col-span-2 grid grid-cols-subgrid gap-x-4 py-2', i < r.length - 1 && 'border-b border-dashed border-outline-variant')}>
          <dt className="text-on-surface-variant">{k}</dt>
          <dd className="m-0 text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function DetailSheet({ student: s, open, list, onClose, onOpenStudent, isFav, onFav }) {
  const { t } = useSettings()
  const scroller = useRef(null)
  const pos = s ? list.indexOf(s) : -1
  const prev = pos > 0 ? list[pos - 1] : null
  const next = pos >= 0 && pos < list.length - 1 ? list[pos + 1] : null

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [s?.name])
  useEffect(() => {
    if (!open) return
    const k = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return
      if (e.key === 'ArrowLeft' && prev) onOpenStudent(prev)
      if (e.key === 'ArrowRight' && next) onOpenStudent(next)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, prev, next, onOpenStudent])

  if (!s) return <Sheet open={false} onClose={onClose} label="" />
  const variants = STUDENTS.filter((x) => x.base === s.base && x !== s)
  const bd = s.bd ? `${+s.bd.slice(2)}/${+s.bd.slice(0, 2)}` : ''

  return (
    <Sheet open={open} onClose={onClose} label={s.name}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-primary px-4 pb-2 md:pb-2.5 md:pl-10 md:pr-4 md:pt-4">
        <div className="flex items-center gap-2.5 text-sm font-bold italic">
          <span className="slant h-5 w-3.5 bg-primary [--s:5px]" />
          <span className="text-on-surface-variant">BA List</span>
          {pos >= 0 && <span className="slant bg-primary-container px-4 py-0.5 text-on-primary-container [--s:7px]">{t('of', { a: pos + 1, b: list.length })}</span>}
        </div>
        <IconButton variant="flat" size="sm" onClick={onClose} aria-label={t('close')}><X size={19} /></IconButton>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Ảnh: nền sọc + vòng halo phía sau, KHÔNG có lớp nào đè lên ảnh */}
        <div className="halo stripes relative overflow-hidden bg-gradient-to-b from-primary-container to-surface-mid px-4 pt-5 md:pl-10 md:pr-6">
          <Portrait s={s} w={400} full className="cut-bl relative z-10 mx-auto h-[min(42dvh,340px)] w-[min(100%,320px)] bg-surface-high" />
        </div>

        <div className="px-4 pb-6 pt-4 md:pl-10 md:pr-6">
          <h2 className="text-[1.9rem] font-extrabold italic leading-tight">{s.name}</h2>
          <p className="text-on-surface-variant">{s.ja}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-lg font-extrabold italic text-primary max-sm:w-full">{fullName(s)}</span>
            <CopyButton s={s} variant="tonal" />
            <FavButton on={isFav} onToggle={() => onFav(s)} variant="tonal" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5"><Stars n={s.rarity} className="mr-1 !text-xl" /><StudentTags s={s} /></div>

          <div className="mt-5 grid gap-3">
            <Section icon={Swords} title={t('d.combat')} i={0}>
              <Rows rows={[
                [t('l.school'), s.schoolL], [t('l.cls'), s.clsL], [t('l.role'), s.roleL], [t('l.pos'), s.posL], [t('l.weapon'), s.weaponL],
                [t('l.cover'), s.cover ? t('yes') : t('no')], [t('l.pool'), cap(s.pool)], [t('l.variant'), s.variant === 'none' ? t('original') : cap(s.variant)],
              ]} />
            </Section>
            <Section icon={UserRound} title={t('d.personal')} i={1}>
              <Rows rows={[[t('l.age'), s.age], [t('l.bd'), bd], [t('l.height'), s.height && `${s.height} cm`], [t('l.hobbies'), s.hobbies]]} />
            </Section>
            <Section icon={Layers} title={t('d.terrain')} i={2}>
              <div className="grid grid-cols-3 gap-2">
                {[['urban', s.urban], ['outdoor', s.outdoor], ['indoor', s.indoor]].map(([k, g]) => (
                  <div key={k} className="cut-bl-sm border-t-4 bg-surface-low py-3 text-center" style={{ borderColor: GRADE_COLOR[g] }}>
                    <b className="block text-[2.1rem] font-black italic leading-none" style={{ color: GRADE_COLOR[g] }}>{g}</b>
                    <span className="mt-1 block text-xs font-semibold text-on-surface-variant">{t(`l.${k}`)}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Section icon={CalendarDays} title={t('d.release')} i={3}>
              <Rows rows={[
                [t('l.rjp'), fmtDate(s.rjp)], [t('l.rgl'), fmtDate(s.rgl) || t('l.notReleased')], [t('l.cv'), s.cv],
                [t('l.designer'), s.designer], [t('l.illustrator'), s.illustrator], [t('l.lobby'), s.lobby],
              ]} />
            </Section>
            {variants.length > 0 && (
              <Section icon={Palette} title={t('d.variants', { name: s.base })} i={4}>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.name} type="button" onClick={() => onOpenStudent(v)}
                      className="slant h-9 bg-surface-high px-6 text-sm font-semibold italic transition-all duration-200 ease-out-back hover:bg-primary hover:text-on-primary active:scale-95"
                    >{v.name}</button>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-t-[3px] border-primary bg-surface-low px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:pl-9">
        <button
          type="button" disabled={!prev} onClick={() => prev && onOpenStudent(prev)} aria-label={t('prev')}
          className="slant inline-flex h-11 items-center gap-1 justify-self-start bg-primary-container pl-5 pr-7 text-sm font-bold italic text-on-primary-container transition-all duration-200 ease-out-back hover:bg-primary hover:text-on-primary active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        ><ChevronLeft size={18} />{t('prev')}</button>
        <a
          href={s.url} target="_blank" rel="noopener noreferrer"
          className="slant inline-flex h-11 items-center gap-1.5 bg-hl px-7 text-sm font-extrabold italic text-on-hl transition-all duration-200 ease-out-back hover:brightness-105 active:scale-95"
        >{t('wiki')}<ExternalLink size={14} /></a>
        <button
          type="button" disabled={!next} onClick={() => next && onOpenStudent(next)} aria-label={t('next')}
          className="slant inline-flex h-11 items-center gap-1 justify-self-end bg-primary pl-7 pr-5 text-sm font-bold italic text-on-primary transition-all duration-200 ease-out-back hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        >{t('next')}<ChevronRight size={18} /></button>
      </footer>
    </Sheet>
  )
}
