import { forwardRef, useId } from 'react'
import Select, { optionsFromChildren } from './Select'

// Ô nhập liệu phẳng: nhãn nằm phía trên, viền mảnh, vòng focus theo --ring của theme.
// - as="input" (mặc định) | "textarea" | "select" (dropdown tự dựng, xem Select.jsx)
// - leading: icon đứng đầu
// (alwaysFloat / fieldBg còn được nhận để tương thích với nơi gọi cũ nhưng không còn tác dụng.)
const TextField = forwardRef(function TextField(
  // eslint-disable-next-line no-unused-vars
  { label, as = 'input', alwaysFloat, leading, className = '', fieldBg, children, placeholder, id, ...props },
  ref
) {
  const Tag = as
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={`field ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <div className="field-control">
        {leading && <span className="field-icon" style={{ left: 12 }}>{leading}</span>}
        {as === 'select' ? (
          <Select id={fieldId} value={props.value} onChange={props.onChange} disabled={props.disabled} options={optionsFromChildren(children)} />
        ) : (
          <Tag
            ref={ref}
            id={fieldId}
            placeholder={placeholder}
            className={`field-input ${leading ? 'has-leading' : ''}`}
            {...props}
          >
            {children}
          </Tag>
        )}
      </div>
    </div>
  )
})

export default TextField
