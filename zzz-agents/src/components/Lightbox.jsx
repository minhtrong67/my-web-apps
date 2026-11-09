import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Btn, IconBtn } from './Btn.jsx'
import { useLayer } from '../useLayer.js'
import { useSettings } from '../settings.jsx'

export default function Lightbox({ a, pos, total, onClose, onPrev, onNext }) {
  const { t } = useSettings()
  const ref = useRef(null)
  const sx = useRef(null)
  const srcs = [a.image, a.banner].filter(Boolean)
  const [k, setK] = useState(0)
  useEffect(() => setK(0), [a.id])
  useLayer(ref, true, onClose)
  useEffect(() => {
    const key = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.stopPropagation(); e.preventDefault()
      e.key === 'ArrowLeft' ? onPrev() : onNext()
    }
    addEventListener('keydown', key, true)
    return () => removeEventListener('keydown', key, true)
  }, [onPrev, onNext])
  const stop = (e) => e.stopPropagation()
  const src = srcs[k]
  return createPortal(
    <div ref={ref} tabIndex={-1} className="fade fixed inset-0 z-[70] flex flex-col bg-black/95" onClick={onClose} role="dialog" aria-modal="true" aria-label={a.name}
      onTouchStart={(e) => (sx.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - sx.current; if (Math.abs(d) > 60) d > 0 ? onPrev() : onNext() }}>
      <div className="flex items-center justify-between gap-3 p-3 text-white" onClick={stop} style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="min-w-0">
          <p className="truncate text-lg font-black uppercase italic">{a.name}</p>
          <p className="font-mono text-xs text-white/60">{pos > 0 ? `${pos} / ${total}` : ''}</p>
        </div>
        <div className="flex gap-2">
          {srcs.length > 1 && <Btn icon="refresh" variant="info" label={t('altImage')} onClick={() => setK((x) => (x + 1) % srcs.length)} />}
          <Btn icon="close" variant="neutral" label={t('close')} onClick={onClose} />
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <div className="absolute left-2 z-10 sm:left-4" onClick={stop}><IconBtn icon="left" label={`${t('prevAgent')} (←)`} onClick={onPrev} active className="!p-3" /></div>
        {src
          ? <img key={src} src={src} alt={a.name} draggable="false" onClick={stop} onError={() => srcs.length > 1 && k === 0 && setK(1)} className="fade max-h-full max-w-full select-none object-contain" />
          : <span className="text-8xl font-black italic text-white/30">{a.name[0]}</span>}
        <div className="absolute right-2 z-10 sm:right-4" onClick={stop}><IconBtn icon="right" label={`${t('nextAgent')} (→)`} onClick={onNext} active className="!p-3" /></div>
      </div>
      <div className="h-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>, document.body)
}
