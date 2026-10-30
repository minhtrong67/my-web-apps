import { useState } from 'react'
import { Search, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react'
import Input from './Input'
import Select from './Select'
import Button from './Button'
import { useLang } from '../../context/LangContext'

/**
 * Thanh công cụ của danh sách: một accordion "Tìm kiếm và lọc" gồm ô tìm kiếm, sắp xếp và các bộ lọc bổ sung (children).
 */
export default function Toolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions,
  onResetFilters,
  hasActiveFilters,
  children,
}) {
  const { t } = useLang()
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] p-3 sm:p-4 mb-4 flex flex-col">
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        className="m3-ripple morph flex items-center justify-between gap-2 w-full px-5 h-12 rounded-full bg-[var(--md-surface-container-highest)] text-sm font-semibold text-[var(--md-on-surface)]"
      >
        <span className="inline-flex items-center gap-2.5">
          <SlidersHorizontal size={18} className="text-[var(--md-primary)]" />
          {t('common.filter')}
          {hasActiveFilters && (
            <span className="anim-pop text-[11px] font-bold rounded-full px-2.5 py-0.5 bg-[var(--md-primary)] text-[var(--md-on-primary)]">
              {t('common.filterActive')}
            </span>
          )}
        </span>
        <ChevronDown size={18} className={`text-[var(--md-on-surface-variant)] transition-transform duration-300 ease-[var(--ease-spring)] ${filtersOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Accordion: animate bằng grid-template-rows nên mở/đóng mượt, không cần max-height. */}
      <div className={`accordion ${filtersOpen ? 'accordion-open' : ''}`} aria-hidden={!filtersOpen} inert={!filtersOpen}>
        <div>
          <div className="flex flex-col gap-3 pt-4 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)] px-1">{t('common.search')}</span>
                <Input
                  icon={Search}
                  placeholder={t('common.searchPlaceholder')}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              {sortOptions && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[var(--md-on-surface-variant)] px-1">{t('common.sort')}</span>
                  <Select value={sort} onChange={(e) => onSortChange(e.target.value)}>
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              {children}
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="dangerSoft" size="sm" icon={RotateCcw} onClick={onResetFilters}>
                  {t('common.resetFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
