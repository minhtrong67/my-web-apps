import { CATEGORY_DOT } from '../data/holidays'
import { useTranslation } from '../i18n/useTranslation'

/** Nhãn danh mục: viền mảnh + 1 chấm màu — chấm là dấu hiệu duy nhất mang màu, phần còn lại giữ trung tính. */
export default function CategoryBadge({ category, className = '' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-2 py-0.5 text-label-sm text-ink-soft ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[category]}`} aria-hidden="true" />
      {t(`category.${category}`)}
    </span>
  )
}
