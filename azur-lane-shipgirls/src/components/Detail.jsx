import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Heart, Loader2, PersonStanding, Ship as ShipIcon, Star, UserRound, X, ZoomIn } from 'lucide-react'
import { RAR, STAT_KEYS, STAT_SHOW, imgUrls, loadExtra, useData } from '../lib/data.js'
import { useI18n } from '../lib/i18n.jsx'
import { Btn, IconBtn, Modal, Segmented, Tooltip, cx } from './UI.jsx'
import { Img } from './ShipCard.jsx'
import { Radar, radarPct } from './Radar.jsx'

const SKILL_COLOR = { pink: '#f472b6', red: '#ef4444', gold: '#facc15', yellow: '#facc15', blue: '#38bdf8', purple: '#a78bfa', green: '#34d399', orange: '#fb923c' }
const AV = { light: 'Light', heavy: 'Heavy', aviation: 'Aviation', limited: 'Limited', exchange: 'Exchange' }

/**
 * Image gallery with two slides the user switches manually (tabs, arrow, swipe):
 *   0 = portrait card, 1 = full artwork.
 * The artwork is a transparent PNG with a lot of empty margin, so it is preloaded in the background,
 * cropped to its visible bounding box on a canvas and the frame is sized to the cropped ratio.
 * Nothing ever changes slide on its own.
 */
function Gallery({ s, rar, title, onZoom }) {
  const { t } = useI18n()
  const [slide, setSlide] = useState(0)
  const [ratio, setRatio] = useState(null)
  const [failed, setFailed] = useState(!s.artU.length)
  const cv = useRef(null)
  const touch = useRef(null)
  const hasArt = s.artU.length > 0

  useEffect(() => {
    if (!s.artU.length) return
    let dead = false
    const draw = (im) => {
      try {
        const sc = Math.min(1, 320 / Math.max(im.naturalWidth, im.naturalHeight))
        const w = Math.max(1, Math.round(im.naturalWidth * sc)), h = Math.max(1, Math.round(im.naturalHeight * sc))
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(im, 0, 0, w, h)
        const d = ctx.getImageData(0, 0, w, h).data
        let x0 = w, y0 = h, x1 = -1, y1 = -1
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
        }
        if (x1 < 0) { setFailed(true); return }
        const pad = Math.round(Math.max(w, h) * 0.03)
        x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad)
        const k = 1 / sc
        const sx = x0 * k, sy = y0 * k, sw = (x1 - x0 + 1) * k, sh = (y1 - y0 + 1) * k
        const out = cv.current
        if (!out) return
        out.width = Math.min(900, Math.round(sw))
        out.height = Math.round((out.width * sh) / sw)
        out.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, out.width, out.height)
        setRatio(sw / sh)
      } catch { setFailed(true) }
    }
    const tryLoad = (i) => {
      const im = new Image()
      im.crossOrigin = 'anonymous'
      im.onload = () => !dead && draw(im)
      im.onerror = () => { if (dead) return; i + 1 < s.artU.length ? tryLoad(i + 1) : setFailed(true) }
      im.src = s.artU[i]
    }
    tryLoad(0)
    return () => { dead = true }
  }, [s.artU])

  const go = (i) => setSlide(Math.max(0, Math.min(hasArt ? 1 : 0, i)))
  const ready = ratio !== null
  const aspect = slide === 0 ? 0.75 : ready ? Math.min(1.35, Math.max(0.7, ratio)) : 0.75
  const swipe = {
    onTouchStart: (e) => { e.stopPropagation(); touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } },
    onTouchEnd: (e) => {
      e.stopPropagation()
      const a = touch.current, b = e.changedTouches[0]
      touch.current = null
      if (a && Math.abs(b.clientX - a.x) > 50 && Math.abs(b.clientY - a.y) < 40) go(slide + (b.clientX < a.x ? 1 : -1))
    }
  }
  const arrow = 'absolute top-1/2 z-[2] -translate-y-1/2'
  const arrowBtn = '!bg-black/50 !text-white backdrop-blur hover:!bg-black/70 !border-transparent'

  return (
    <div className="space-y-2.5">
      <div
        className="relative mx-auto max-h-[52vh] w-full max-w-[18rem] overflow-hidden rounded-md border-2 bg-gradient-to-b from-surf2 to-surf transition-[aspect-ratio] duration-500 sm:max-w-none"
        style={{ aspectRatio: aspect, borderColor: rar.c, boxShadow: `0 10px 30px -14px ${rar.c}` }} {...swipe}
      >
        <div className="absolute inset-0 flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${slide * 100}%)` }}>
          <div className="relative h-full w-full shrink-0">
            <ShipIcon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-muted/40" aria-hidden="true" />
            <Img srcs={s.th} alt={title} className="absolute inset-0 h-full w-full object-cover object-top" />
          </div>
          {hasArt && (
            <div className="relative h-full w-full shrink-0">
              {!ready && !failed && <Loader2 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-muted/60" aria-hidden="true" />}
              <Img srcs={s.th} alt="" className={cx('absolute inset-0 h-full w-full scale-125 object-cover object-top blur-xl transition-opacity duration-500', ready ? 'opacity-40' : 'opacity-0')} />
              <canvas ref={cv} role="img" aria-label={title} className={cx('absolute inset-0 h-full w-full object-contain p-1 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')} />
              {failed && <Img srcs={s.artU} alt={title} className="absolute inset-0 h-full w-full object-contain" />}
            </div>
          )}
        </div>
        <Tooltip label={t('zoom')} className="absolute inset-0 z-[1] flex">
          <button type="button" aria-label={t('zoom')} onClick={() => onZoom({ srcs: slide === 0 ? s.th : s.artU, title })} className="group h-full w-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
            <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-visible:opacity-100"><ZoomIn className="h-4 w-4" aria-hidden="true" /></span>
          </button>
        </Tooltip>
        {hasArt && slide === 0 && <span className={cx(arrow, 'right-2')}><IconBtn label={`${t('nextImage')}`} icon={ChevronRight} onClick={() => go(1)} className={arrowBtn} /></span>}
        {hasArt && slide === 1 && <span className={cx(arrow, 'left-2')}><IconBtn label={`${t('prevImage')}`} icon={ChevronLeft} onClick={() => go(0)} className={arrowBtn} /></span>}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-1" style={{ background: rar.g || rar.c }} />
      </div>
      {hasArt && (
        <Segmented label={t('zoom')} value={slide} onChange={go} options={[
          { value: 0, label: t('imgCard'), icon: UserRound }, { value: 1, label: t('imgArt'), icon: PersonStanding }
        ]} />
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink">{title}</h4>
      {children}
    </section>
  )
}

function NameCopy({ k, v, onCopy }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)
  return (
    <div className="flex min-w-0 items-center gap-1">
      <div className="min-w-0 flex-1"><dt className="text-[11px] font-semibold text-muted">{k.toUpperCase()}</dt><dd className="truncate font-medium" title={v}>{v}</dd></div>
      <IconBtn label={t('copyLang', { lang: k.toUpperCase() })} icon={done ? Check : Copy} className="!h-7 !w-7" onClick={async () => { if (await onCopy(k)) { setDone(true); setTimeout(() => setDone(false), 1200) } }} />
    </div>
  )
}

function Body({ s, nameKey, onCopy, onZoom, onPrev, onNext }) {
  const { t, tv } = useI18n()
  const { STAT_MAX, STAT_REF } = useData()
  const [tab, setTab] = useState('overview')
  const [lv, setLv] = useState(2)
  const [extra, setExtra] = useState(undefined) // undefined = loading, null = none
  const top = useRef(null)
  const touch = useRef(null)
  const rar = RAR[s.r] || RAR.Normal
  const vals = s.s[lv] || s.s[2] || s.s[1] || s.s[0]
  const title = s.n[nameKey] || s.n.en
  const names = [['en', s.n.en], ['cn', s.n.cn], ['jp', s.n.jp], ['kr', s.n.kr]].filter(([, v], i, a) => v && a.findIndex(([, x]) => x === v) === i)
  const info = [[t('id'), s.id], [t('class'), s.cls], [t('build'), s.ct], [t('artist'), s.artist], [t('voice'), s.va], ['Code', s.n.code]].filter(([, v]) => v)

  useEffect(() => { top.current?.closest('.overflow-y-auto')?.scrollTo({ top: 0 }) }, [])
  useEffect(() => {
    if (tab === 'overview' || extra !== undefined) return
    let dead = false
    loadExtra().then((m) => !dead && setExtra(m[s.id] || null)).catch(() => !dead && setExtra(null))
    return () => { dead = true }
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const onTouchEnd = (e) => {
    const a = touch.current, b = e.changedTouches[0]
    touch.current = null
    if (!a) return
    const dx = b.clientX - a.x, dy = b.clientY - a.y
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45) (dx < 0 ? onNext : onPrev)?.()
  }

  const loading = extra === undefined
  const empty = <p className="py-6 text-center text-sm text-muted">{t('noData')}</p>
  const spinner = <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('loadingExtra')}</p>

  return (
    <div ref={top} className="grid items-start gap-5 sm:grid-cols-[14rem_minmax(0,1fr)]" onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }} onTouchEnd={onTouchEnd}>
      <div className="sm:sticky sm:top-0"><Gallery s={s} rar={rar} title={title} onZoom={onZoom} /></div>

      <div className="min-w-0 space-y-5">
        <div>
          <h3 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{title}</h3>
          {title !== s.n.en && <p className="text-sm text-muted">{s.n.en}</p>}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-black" style={{ background: rar.g || rar.c }}><Star className="h-3 w-3 fill-current" aria-hidden="true" />{s.st} · {tv('rarity', s.r)}</span>
            <span className="rounded border border-line bg-surf2 px-2 py-1">{tv('hull', s.hull)}</span>
            <span className="rounded border border-primary/40 bg-primary/10 px-2 py-1 text-ink">{tv('nat', s.nat)}</span>
          </div>
        </div>

        <Segmented label="Tabs" value={tab} onChange={setTab} options={[
          { value: 'overview', label: t('tabOverview') }, { value: 'skills', label: t('tabSkills') }, { value: 'skins', label: t('tabSkins') }, { value: 'obtain', label: t('tabObtain') }
        ]} />

        {tab === 'overview' && (
          <div className="anim-fade space-y-5" key="ov">
            <Section title={t('names')}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">{names.map(([k, v]) => <NameCopy key={k} k={k} v={v} onCopy={(key) => onCopy(key)} />)}</dl>
            </Section>
            <Section title={t('info')}>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {info.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-[11px] font-semibold text-muted">{k}</dt><dd className="truncate font-medium" title={v}>{v}</dd></div>)}
              </dl>
            </Section>
            {vals && (
              <section>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink">{t('stats')}</h4>
                  <div className="w-56 max-w-[60%]">
                    <Segmented label={t('stats')} value={lv} onChange={setLv} options={[{ value: 0, label: t('lv1') }, { value: 1, label: t('lv100') }, { value: 2, label: t('lv120') }].filter((o) => s.s[o.value])} />
                  </div>
                </div>
                <Radar series={[{ pct: radarPct(s, lv, STAT_REF), color: 'rgb(var(--p))' }]} />
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {STAT_SHOW.map((j) => {
                    const n = parseFloat(vals[j])
                    const pct = STAT_MAX[lv][j] ? Math.min(100, ((isNaN(n) ? 0 : n) / STAT_MAX[lv][j]) * 100) : 0
                    return (
                      <div key={j} className="rounded border border-line bg-surf2/60 px-2.5 py-2">
                        <div className="flex items-baseline justify-between gap-2 text-xs"><span className="truncate text-muted">{t('st_' + STAT_KEYS[j])}</span><b className="text-sm tabular-nums">{vals[j] === '' ? '–' : vals[j]}</b></div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
                      </div>
                    )
                  })}
                  <div className="rounded border border-line bg-surf2/60 px-2.5 py-2 text-xs"><span className="text-muted">{t('st_armor')}</span><div className="mt-0.5 text-sm font-bold">{vals[1] || '–'}</div></div>
                </div>
              </section>
            )}
          </div>
        )}

        {tab === 'skills' && (
          <div className="anim-fade space-y-2.5" key="sk">
            {loading ? spinner : !extra?.sk?.length ? empty : extra.sk.map((k, i) => (
              <article key={i} className="flex gap-3 rounded border border-line bg-surf2/50 p-3" style={{ borderLeft: `3px solid ${SKILL_COLOR[k.c] || '#94a3b8'}` }}>
                <Img srcs={imgUrls(k.i)} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded bg-surf object-cover" />
                <div className="min-w-0">
                  <h5 className="text-sm font-bold">{k.n.en || k.n.jp || k.n.cn}</h5>
                  {(k.n.jp || k.n.cn) && <p className="text-xs text-muted">{[k.n.jp, k.n.cn].filter(Boolean).join(' · ')}</p>}
                  <p className="mt-1 text-sm leading-relaxed text-muted">{k.d}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'skins' && (
          <div className="anim-fade" key="sn">
            {loading ? spinner : !extra?.sn?.length ? empty : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {extra.sn.map((k, i) => (
                  <button key={i} type="button" onClick={() => onZoom({ srcs: imgUrls(k.i), title: `${title} — ${k.n}` })} className="group overflow-hidden rounded border border-line bg-surf2/50 text-left transition hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="grid aspect-square place-items-center bg-gradient-to-b from-surf2 to-surf p-2">
                      {k.c ? <Img srcs={imgUrls(k.c)} alt={k.n} loading="lazy" className="max-h-full max-w-full object-contain transition group-hover:scale-110" /> : <ShipIcon className="h-8 w-8 text-muted/40" aria-hidden="true" />}
                    </div>
                    <div className="px-2 py-1.5"><p className="truncate text-xs font-bold">{k.n}</p>{k.t && <p className="truncate text-[11px] text-muted">{k.t}</p>}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'obtain' && (
          <div className="anim-fade space-y-5" key="ob">
            {loading ? spinner : !extra ? empty : (
              <>
                {extra.ob && (
                  <Section title={t('obtain')}>
                    <ul className="space-y-1.5 text-sm">{extra.ob.split('\n').filter(Boolean).map((l, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{l}</li>)}</ul>
                  </Section>
                )}
                {extra.av && (
                  <Section title={t('construction')}>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {Object.entries(AV).map(([k, label]) => {
                        const v = extra.av[k]
                        return (
                          <div key={k} className="flex items-center justify-between gap-2 rounded border border-line bg-surf2/60 px-2.5 py-2 text-xs">
                            <span className="text-muted">{label}</span>
                            {typeof v === 'string' ? <b className="truncate">{v}</b> : v ? <Check className="h-4 w-4 text-emerald-500" aria-label={t('yes')} /> : <X className="h-4 w-4 text-muted/60" aria-label={t('no')} />}
                          </div>
                        )
                      })}
                    </div>
                  </Section>
                )}
                {extra.sl?.length > 0 && (
                  <Section title={t('equip')}>
                    <ul className="space-y-1.5 text-sm">
                      {extra.sl.map(([type, max, lo, hi], i) => (
                        <li key={i} className="flex items-center justify-between gap-3 rounded border border-line bg-surf2/50 px-3 py-2"><span className="font-medium">{type}</span><span className="tabular-nums text-muted">×{max} · {lo === hi ? lo : `${lo}–${hi}`}%</span></li>
                      ))}
                    </ul>
                  </Section>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Detail({ s, open, onClose, onCopy, onPrev, onNext, pos, total, fav, own, onFav, onOwn, nameKey }) {
  const { t } = useI18n()
  const [zoom, setZoom] = useState(null)
  const lastZoom = useRef(null)
  if (zoom) lastZoom.current = zoom
  const z = zoom || lastZoom.current

  useEffect(() => {
    if (!open || zoom) return
    const k = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA/.test(e.target.tagName) || e.target.closest?.('[role=listbox],[role=radiogroup]')) return
      if (e.key === 'ArrowLeft' && onPrev) { e.preventDefault(); onPrev() }
      else if (e.key === 'ArrowRight' && onNext) { e.preventDefault(); onNext() }
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open, zoom, onPrev, onNext])

  if (!s) return null
  return (
    <>
      <Modal
        open={open} onClose={onClose} title={s.n[nameKey] || s.n.en} icon={ShipIcon} size="lg"
        footer={<>
          {pos > 0 && (
            <div className="mr-auto flex items-center gap-1">
              <IconBtn label={`${t('prev')} (←)`} icon={ChevronLeft} onClick={onPrev} disabled={!onPrev} className="disabled:opacity-40" />
              <span className="min-w-14 text-center text-xs font-semibold tabular-nums text-muted">{pos} / {total}</span>
              <IconBtn label={`${t('next')} (→)`} icon={ChevronRight} onClick={onNext} disabled={!onNext} className="disabled:opacity-40" />
            </div>
          )}
          <Btn tone={fav ? 'danger' : 'neutral'} icon={Heart} aria-pressed={fav} onClick={() => onFav(s)} className={fav ? '!px-3 [&_svg]:fill-current' : '!px-3'}>{t('favorite')}</Btn>
          <Btn tone={own ? 'success' : 'neutral'} icon={BadgeCheck} aria-pressed={own} onClick={() => onOwn(s)} className="!px-3">{t('owned')}</Btn>
          <Btn tone="neutral" icon={X} onClick={onClose} className="!px-3">{t('close')}</Btn>
          {s.wiki && <Btn tone="info" icon={ExternalLink} className="!px-3" onClick={() => window.open(s.wiki, '_blank', 'noopener,noreferrer')}>{t('wiki')}</Btn>}
          <Btn tone="primary" icon={Copy} className="!px-3" onClick={() => onCopy(s)}>{t('copyName')}</Btn>
        </>}
      >
        <Body key={s.id} s={s} nameKey={nameKey} onCopy={(key) => onCopy(s, key)} onZoom={setZoom} onPrev={onPrev} onNext={onNext} />
      </Modal>
      <Modal open={!!zoom} onClose={() => setZoom(null)} title={z?.title || ''} icon={ZoomIn} size="lg" footer={<Btn tone="neutral" icon={X} onClick={() => setZoom(null)}>{t('close')}</Btn>}>
        {z && <div className="grid min-h-48 place-items-center rounded-md bg-gradient-to-b from-surf2 to-surf p-2"><Img srcs={z.srcs} alt={z.title} className="max-h-[68vh] w-auto max-w-full object-contain" /></div>}
      </Modal>
    </>
  )
}
