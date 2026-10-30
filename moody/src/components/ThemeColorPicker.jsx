import { useState } from 'react'
import { Check } from './icons'
import { PALETTES } from '../lib/palettes'
import { getStoredThemeColor, setThemeColor } from '../lib/theme'
import { useIsDark } from '../hooks/useIsDark'
import { useI18n } from '../i18n'

// Chọn màu chủ đề (Material 3 Expressive): mỗi ô là bảng màu TonalSpot sinh từ một seed.
// Ô được chọn biến hình từ tròn sang bo vuông (shape morph) và hiện dấu ✓.
export default function ThemeColorPicker() {
  const { t } = useI18n()
  const isDark = useIsDark()
  const [active, setActive] = useState(getStoredThemeColor)

  const pick = (id) => {
    setActive(id)
    setThemeColor(id)
  }

  return (
    <div className="card-tonal p-4">
      <div role="radiogroup" aria-label={t('settings.themeColor')} className="grid grid-cols-5 gap-x-2 gap-y-4">
        {PALETTES.map((p) => {
          const c = isDark ? p.dark : p.light
          const selected = active === p.id
          return (
            <div key={p.id} className="flex flex-col items-center gap-1.5 min-w-0">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t(`themeColor.${p.id}`)}
                onClick={() => pick(p.id)}
                className="relative w-12 h-12 overflow-hidden transition-[border-radius,transform,box-shadow] duration-500 ease-spring-fast active:scale-90"
                style={{
                  borderRadius: selected ? '32%' : '50%',
                  boxShadow: selected ? `0 0 0 3px var(--c-surface-container), 0 0 0 5px ${c.primary}` : 'none'
                }}
              >
                <span className="absolute inset-0" style={{ background: c.primary }} />
                <span className="absolute left-0 right-1/2 top-1/2 bottom-0" style={{ background: c['secondary-container'] }} />
                <span className="absolute left-1/2 right-0 top-1/2 bottom-0" style={{ background: c['tertiary-container'] }} />
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center" style={{ color: c['on-primary'] }}>
                    <Check size={22} strokeWidth={3} />
                  </span>
                )}
              </button>
              <span className={`t-label-small text-center leading-tight ${selected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {t(`themeColor.${p.id}`)}
              </span>
            </div>
          )
        })}
      </div>
      <p className="t-body-small text-on-surface-variant mt-4">{t('settings.themeColorHint')}</p>
    </div>
  )
}
