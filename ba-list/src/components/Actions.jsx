import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Heart } from 'lucide-react'
import { copyText, useSettings, useToast } from '../lib/app-context.jsx'
import { fullName } from '../lib/students.js'
import { cx } from './ui.jsx'

const BASE = 'slant slant-sm inline-flex shrink-0 items-center justify-center gap-2 transition-all duration-200 ease-out-back active:scale-90'
const LOOK = {
  card: 'size-10 bg-surface-high text-on-surface-variant hover:bg-primary hover:text-on-primary',
  tonal: 'h-10 bg-primary-container px-6 text-sm font-bold italic text-on-primary-container hover:bg-primary hover:text-on-primary',
  icon: 'size-9 text-on-surface-variant hover:bg-primary/15 hover:text-primary',
}

/* Nút sao chép họ tên */
export function CopyButton({ s, variant = 'card', className }) {
  const { t } = useSettings(), toast = useToast()
  const [done, setDone] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const name = fullName(s)
  const onClick = async (e) => {
    e.stopPropagation()
    if (!(await copyText(name))) return toast.error(t('copy.fail'), { sub: t('copy.failSub'), key: 'copy' })
    setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 1500)
    toast.success(t('copy.ok'), { sub: name, key: 'copy', ms: 2000 })
  }
  const Icon = done ? Check : Copy
  return (
    <button
      type="button" onClick={onClick} title={t('copy.title')} aria-label={`${t('copy.title')}: ${name}`}
      className={cx(BASE, LOOK[variant], done && '!bg-ok !text-white', className)}
    >
      <Icon size={18} strokeWidth={done ? 3 : 2.2} className={done ? 'animate-pop' : ''} />
      {variant === 'tonal' && <span>{done ? t('copy.done') : t('copy.btn')}</span>}
    </button>
  )
}

/* Nút yêu thích (trái tim) */
export function FavButton({ on, onToggle, variant = 'card', className }) {
  const { t } = useSettings()
  return (
    <button
      type="button" aria-pressed={on} title={on ? t('fav.remove') : t('fav.add')} aria-label={on ? t('fav.remove') : t('fav.add')}
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      className={cx(BASE, LOOK[variant === 'tonal' ? 'card' : variant], variant === 'tonal' && '!size-10', on && '!bg-[#ff5c7a]/15', className)}
    >
      <Heart size={18} strokeWidth={2.2} className={cx('transition-all duration-300 ease-out-back', on && 'scale-110 fill-[#ff5c7a] text-[#ff5c7a]')} />
    </button>
  )
}
