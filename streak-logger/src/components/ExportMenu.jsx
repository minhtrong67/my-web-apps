import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, FileImage, FileJson, FileSpreadsheet, FileText, FileType, FileDown } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { EXPORT_FORMATS } from '../utils/exportData'
import Button from './ui/Button'
import Sheet from './ui/Sheet'

const FORMAT_ICONS = {
  csv: FileText,
  json: FileJson,
  excel: FileSpreadsheet,
  word: FileType,
  pdf: FileDown,
  png: FileImage,
}

function FormatItem({ format, onSelect, text }) {
  const { t } = useLang()
  const Icon = FORMAT_ICONS[format]
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onSelect(format)}
      className="m3-ripple w-full flex items-center gap-3 px-3 h-14 rounded-full text-sm font-semibold text-[var(--md-on-surface)] text-left"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shrink-0">
        <Icon size={18} />
      </span>
      {text || t(`common.exportFormats.${format}`)}
    </button>
  )
}

/**
 * Nút "Xuất" chọn định dạng (CSV, JSON, Excel, Word, PDF, PNG). Desktop mở menu thả xuống,
 * mobile mở sheet đáy cho dễ chạm. `onExport(format)` có thể async: nút hiện trạng thái
 * đang xử lý và bị vô hiệu hóa cho tới khi xuất xong, tránh bấm nhiều lần.
 */
export default function ExportMenu({
  onExport,
  formats = EXPORT_FORMATS,
  variant = 'tonal',
  label,
  disabled = false,
  className = '',
  formatLabels = {},
}) {
  const { t } = useLang()
  const compact = useMediaQuery('(max-width: 639px)')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  // Đóng menu thả xuống khi bấm ra ngoài hoặc nhấn Escape (sheet tự lo phần của nó).
  useEffect(() => {
    if (!open || compact) return undefined
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, compact])

  const handleSelect = async (format) => {
    setOpen(false)
    setBusy(true)
    try {
      await onExport(format)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <Button
        variant={variant === 'primary' ? 'primary' : variant === 'outline' ? 'tonal' : variant}
        icon={Download}
        loading={busy}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-full"
      >
        <span>{busy ? t('common.exporting') : label || t('common.export')}</span>
        {!busy && <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />}
      </Button>

      {open && !compact && (
        <div
          role="menu"
          className="anim-menu-in absolute right-0 top-full mt-2 z-30 w-60 rounded-[24px] bg-[var(--md-surface-container-high)] shadow-[var(--shadow-modal)] p-2 flex flex-col"
        >
          {formats.map((key) => (
            <FormatItem key={key} format={key} text={formatLabels[key]} onSelect={handleSelect} />
          ))}
        </div>
      )}

      {compact && (
        <Sheet open={open} onClose={() => setOpen(false)} title={t('common.exportDialogTitle')} variant="bottom">
          <div role="menu" className="flex flex-col">
            {formats.map((key) => (
              <FormatItem key={key} format={key} text={formatLabels[key]} onSelect={handleSelect} />
            ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}
