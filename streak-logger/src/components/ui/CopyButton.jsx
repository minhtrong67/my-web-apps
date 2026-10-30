import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { useToast } from '../../context/ToastContext'

/** Nút sao chép: đổi sang dấu tích có hiệu ứng nảy và báo bằng toast. */
export default function CopyButton({ text, label, className = '' }) {
  const { t } = useLang()
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    toast.success(t('toast.copied'))
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || t('common.copy')}
      title={label || t('common.copy')}
      className={`m3-ripple morph inline-flex items-center justify-center w-10 h-10 rounded-full active:rounded-[12px] ${
        copied
          ? 'bg-[var(--md-success-container)] text-[var(--md-on-success-container)]'
          : 'text-[var(--md-on-surface-variant)]'
      } ${className}`}
    >
      {copied ? <Check key="ok" size={18} className="anim-pop" /> : <Copy size={18} />}
    </button>
  )
}
