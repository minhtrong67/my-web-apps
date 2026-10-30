import { forwardRef } from 'react'
import { fieldBase } from './Input'

const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} rows={3} className={`${fieldBase} resize-y ${className}`} {...props} />
})

export default Textarea
