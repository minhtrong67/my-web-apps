import { CATEGORY_DOT } from '../data/holidays'
import { useTranslation } from '../i18n/useTranslation'

/** Nhãn danh mục: viên thuốc tonal + 1 chấm màu theo vai trò màu của theme. */
export default function CategoryBadge({ category, className = '' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-surface-high px-2.5 py-1 text-label-sm text-on-surface-variant ${className}`}>
      <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[category]}`} aria-hidden="true" />
      {t(`category.${category}`)}
    </span>
  )
}
