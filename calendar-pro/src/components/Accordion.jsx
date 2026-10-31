import { useId, useState } from 'react'
import Icon from './Icon'

/**
 * Accordion cho các nhóm cài đặt dài. Tiêu đề luôn hiển thị kèm "tóm tắt" giá trị đang chọn (ví dụ tên màu,
 * tên phông chữ) nên người dùng không cần mở ra cũng biết trạng thái hiện tại.
 *
 *  • Mở/đóng bằng grid-template-rows 0fr → 1fr: chiều cao tự tính, không cần đo bằng JS, chỉ một lần layout.
 *  • Nội dung đang đóng được đặt `inert` → không thể focus bằng bàn phím / đọc bởi trình đọc màn hình.
 *  • aria-expanded / aria-controls / role="region" đầy đủ; phím Enter/Space là hành vi mặc định của <button>.
 */
export default function Accordion({ icon, title, subtitle, summary, defaultOpen = false, onOpenChange, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId()
  const buttonId = `${uid}-btn`
  const panelId = `${uid}-panel`

  function toggle() {
    setOpen((v) => {
      onOpenChange?.(!v)
      return !v
    })
  }

  return (
    <section className="reveal mt-4 overflow-hidden rounded-[28px] bg-surface-container">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="state focus-ring flex w-full items-center gap-4 p-4 text-left sm:px-6 sm:py-5"
      >
        {icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Icon name={icon} size={24} filled />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-title-md text-on-surface">{title}</span>
          {subtitle && <span className="mt-0.5 block text-body-sm text-on-surface-variant">{subtitle}</span>}
        </span>
        {summary && (
          <span className="hidden max-w-[45%] shrink-0 items-center gap-2 truncate rounded-full bg-surface-high px-3.5 py-1.5 text-label-lg text-on-surface sm:flex">
            {summary}
          </span>
        )}
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-spatial-fast ease-spatial-fast ${
            open ? 'rotate-180 bg-primary-container text-on-primary-container' : 'bg-surface-high text-on-surface-variant'
          }`}
        >
          <Icon name="expand_more" size={24} weight={500} />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-[380ms] ease-emphasized ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden" inert={open ? undefined : ''}>
          <div className={`px-4 pb-5 pt-1 transition-opacity duration-300 ease-effects sm:px-6 sm:pb-6 ${open ? 'opacity-100 delay-75' : 'opacity-0'}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
