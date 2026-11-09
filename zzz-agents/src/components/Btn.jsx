import Ic from '../icons.jsx'
import Tooltip from './Tooltip.jsx'

const V = {
  primary: 'bg-p text-onp', danger: 'bg-red-600 text-white', success: 'bg-emerald-600 text-white',
  info: 'bg-sky-600 text-white', neutral: 'bg-fg text-bg', ghost: 'border border-line bg-surface text-fg hover:border-p'
}
// Nút hành động: luôn có icon + label + màu nền tương ứng
export function Btn({ icon, label, variant = 'primary', onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`btn cut-sm inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide transition hover:brightness-110 ${V[variant]} ${className}`}>
      {icon && <Ic n={icon} className="h-4 w-4" />}{label}
    </button>
  )
}
// Nút chỉ có icon: bắt buộc có tooltip
export function IconBtn({ icon, label, onClick, active, fill, className = '' }) {
  return (
    <Tooltip label={label}>
      <button type="button" aria-label={label} aria-pressed={active} onClick={onClick}
        className={`btn cut-sm p-2 transition ${active ? 'bg-p text-onp' : 'border border-line bg-surface hover:border-p hover:text-pt'} ${className}`}>
        <Ic n={icon} className="h-5 w-5" fill={fill} />
      </button>
    </Tooltip>
  )
}
