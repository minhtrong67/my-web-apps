import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../../context/LangContext'

const navBtn =
  'm3-ripple morph inline-flex items-center justify-center w-10 h-10 rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)] disabled:opacity-35 disabled:pointer-events-none'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const { t } = useLang()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  if (total === 0) return null

  // Danh sách số trang gọn: luôn có trang đầu, cuối, trang hiện tại ±1, các khoảng trống là dấu "…".
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[var(--md-outline-variant)]">
      <p className="text-xs text-[var(--md-on-surface-variant)] order-2 sm:order-1">
        {t('common.showingRange', { from, to, total })}
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button type="button" aria-label={t('common.prevPage')} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={navBtn}>
          <ChevronLeft size={18} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="w-8 h-10 inline-flex items-center justify-center text-xs text-[var(--md-on-surface-variant)]">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`m3-ripple morph w-10 h-10 text-sm font-semibold tabular ${
                p === page
                  ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] rounded-[14px]'
                  : 'rounded-full active:rounded-[12px] text-[var(--md-on-surface-variant)]'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" aria-label={t('common.nextPage')} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={navBtn}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
