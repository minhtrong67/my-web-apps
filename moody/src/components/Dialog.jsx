import { createPortal } from 'react-dom'
import { useMountTransition, useBodyScrollLock, useEscape } from '../hooks/useOverlay'

// Dialog phẳng: nền popover, viền mảnh, bo góc theo --radius, tiêu đề đậm vừa.
// Nút hành động đặt trong `children` (dùng <DialogActions>); mỗi nút nên có icon + label + nền màu.
// Có animation mở/đóng (opacity + scale) — chỉ dùng thuộc tính chạy trên GPU.
export default function Dialog({ open, title, onClose, children }) {
  const { mounted, visible } = useMountTransition(open, 180)
  useBodyScrollLock(mounted)
  useEscape(open, onClose)

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" role="presentation">
      <div
        className={`absolute inset-0 scrim transition-opacity ${visible ? 'duration-[250ms] ease-out' : 'duration-[150ms] ease-in'} ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full max-w-sm bg-popover text-popover-foreground rounded-xl p-6 shadow-elev-3 transition-[opacity,transform] ${visible ? 'duration-[280ms] ease-[var(--ease-emphasized-decel)]' : 'duration-[150ms] ease-[var(--ease-emphasized-accel)]'} ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        <p className="t-headline-small mb-4">{title}</p>
        {children}
      </div>
    </div>,
    document.body
  )
}

// Hai nút bằng nhau, dễ bấm bằng ngón tay: [Hủy] [Xác nhận].
export function DialogActions({ children }) {
  return <div className="grid grid-cols-2 gap-3 mt-6">{children}</div>
}
