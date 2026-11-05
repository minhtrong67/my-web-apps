import { useId, useState } from 'react'
import { Check, ChevronDown } from './icons'
import { PALETTES } from '../lib/palettes'
import { getStoredThemeColor, setThemeColor } from '../lib/theme'
import { useIsDark } from '../hooks/useIsDark'
import { useI18n } from '../i18n'

// Chọn màu chủ đề (Material 3 Expressive): mỗi ô là bảng màu TonalSpot sinh từ một seed.
// Ô được chọn biến hình từ tròn sang bo vuông (shape morph) và hiện dấu ✓.
// Dạng accordion: thanh tiêu đề luôn hiện màu đang dùng; bấm để mở / thu gọn lưới 19 màu
// (animate bằng grid-template-rows 0fr → 1fr nên mượt mà không cần đo chiều cao bằng JS).
export default function ThemeColorPicker() {
  const { t } = useI18n()
  const isDark = useIsDark()
  const [active, setActive] = useState(getStoredThemeColor)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const current = PALETTES.find((p) => p.id === active) || PALETTES[0]
  const cur = isDark ? current.dark : current.light

  const pick = (id) => {
    setActive(id)
    setThemeColor(id)
  }

  return (
    <div className="card-tonal overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="state w-full flex items-center gap-4 px-4 py-3 text-left"
      >
        <span className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
          <span className="absolute inset-0" style={{ background: cur.primary }} />
          <span className="absolute left-0 right-1/2 top-1/2 bottom-0" style={{ background: cur['secondary-container'] }} />
          <span className="absolute left-1/2 right-0 top-1/2 bottom-0" style={{ background: cur['tertiary-container'] }} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="t-body-large block truncate">{t(`themeColor.${current.id}`)}</span>
          <span className="t-body-small text-on-surface-variant block truncate">
            {t(open ? 'settings.themeColorCollapse' : 'settings.themeColorExpand')}
          </span>
        </span>
        <ChevronDown
          size={24}
          className={`text-on-surface-variant shrink-0 transition-transform duration-300 ease-emphasized ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-300 ease-emphasized"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        inert={open ? undefined : ''}
      >
        <div className="overflow-hidden min-h-0">
          <div className={`px-4 pb-4 pt-2 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
            {/* 19 màu = 5 + 5 + 5 + 4: flex-wrap + justify-center để hàng cuối (4 ô) nằm giữa, lưới luôn cân đối. */}
            <div role="radiogroup" aria-label={t('settings.themeColor')} className="flex flex-wrap justify-center gap-y-4">
        {PALETTES.map((p) => {
          const c = isDark ? p.dark : p.light
          const selected = active === p.id
          return (
            <div key={p.id} className="basis-1/5 flex flex-col items-center gap-1.5 min-w-0 px-0.5">
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
              <span className={`t-label-small text-center leading-tight text-balance ${selected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {t(`themeColor.${p.id}`)}
              </span>
            </div>
          )
        })}
            </div>
            <p className="t-body-small text-on-surface-variant mt-4">{t('settings.themeColorHint')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
