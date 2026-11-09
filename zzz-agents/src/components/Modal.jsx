import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLayer } from '../useLayer.js'

export default function Modal({ open, onClose, title, children, footer, wide, split }) {
  const ref = useRef(null)
  useLayer(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-3" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade absolute inset-0 bg-black/75" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className={`dlg cut relative flex max-h-[92dvh] w-full flex-col border-2 border-p bg-bg ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
        <div className="stripes h-2 shrink-0" />
        {title && <h2 className="px-5 pt-4 text-xl font-black uppercase italic">{title}</h2>}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className={`flex shrink-0 flex-wrap ${split ? 'justify-between' : 'justify-end'} gap-2 border-t border-line bg-surface px-5 py-3`}>{footer}</div>}
      </div>
    </div>, document.body)
}
