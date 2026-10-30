import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Nút hành động nổi (FAB) của Material 3 Expressive. Trên màn hình lớn là FAB mở rộng có nhãn,
 * trên mobile chỉ còn biểu tượng và nằm phía trên thanh điều hướng dưới.
 * FAB được vẽ qua portal vào <body>: phần tử `position: fixed` nằm trong vùng có transform/animation
 * sẽ bị định vị theo vùng đó thay vì theo màn hình, khiến nút không hiện đúng chỗ.
 * Khi hiển thị, FAB đặt biến CSS `--fab-offset` để nút "lên đầu trang" tự nâng lên, không chồng nhau.
 */
export default function Fab({ icon: Icon, label, onClick }) {
  useEffect(() => {
    document.documentElement.style.setProperty('--fab-offset', '4.75rem')
    return () => document.documentElement.style.removeProperty('--fab-offset')
  }, [])

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="m3-ripple morph anim-fab-in fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:bottom-8 right-4 lg:right-8 z-40 h-14 min-w-14 lg:h-16 lg:px-6 inline-flex items-center justify-center gap-3 rounded-[20px] active:rounded-[28px] lg:rounded-[22px] bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-[var(--shadow-fab)] font-bold text-base"
    >
      <Icon size={26} strokeWidth={2.4} />
      <span className="hidden lg:inline">{label}</span>
    </button>,
    document.body,
  )
}
