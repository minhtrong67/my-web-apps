import { useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/Button'
import Accordion from '../components/Accordion'
import { Page, PageHeader } from '../components/Page'
import Switch from '../components/Switch'
import ConfirmDialog from '../components/ConfirmDialog'
import { FONT_OPTIONS, getFont, loadFont } from '../lib/fonts'
import { withThemeTransition } from '../lib/themeTransition'
import THEME_JSON from '../theme/swatches.json'
import { useSettings, COLOR_OPTIONS, LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from '../contexts/SettingsContext'
import { useToast } from '../contexts/ToastContext'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { formatVNDate } from '../lib/dateUtils'
import { useTranslation } from '../i18n/useTranslation'

const PREVIEW_DATE = new Date(2026, 7, 7) // 07/08/2026 — cố định để bản xem trước cỡ chữ luôn nhất quán

export default function SettingsPage() {
  const { settings, effectiveColor, isDark, update, reset } = useSettings()
  const { notify } = useToast()
  const { t, lang } = useTranslation()
  const { canInstall, installed, promptInstall } = usePwaInstall()
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  const THEME_MODES = [
    { id: 'light', label: t('settings.light'), icon: 'light_mode' },
    { id: 'dark', label: t('settings.dark'), icon: 'dark_mode' },
    { id: 'system', label: t('settings.system'), icon: 'devices' }
  ]

  const effectiveColorOption = COLOR_OPTIONS.find((c) => c.id === effectiveColor)
  const currentFont = getFont(settings.fontFamily)
  const swatch = THEME_JSON[effectiveColor]?.[isDark ? 'dark' : 'light']

  function handleReset() {
    reset()
    notify(t('settings.resetDone'), { type: 'info', title: t('settings.resetDoneTitle') })
  }

  async function handleInstall() {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      notify(t('settings.installSuccess'), { type: 'success', title: t('settings.installSuccessTitle') })
    }
  }

  function handleRandomColor() {
    const others = COLOR_OPTIONS.filter((c) => c.id !== settings.color)
    const pick = others[Math.floor(Math.random() * others.length)] ?? COLOR_OPTIONS[0]
    update({ color: pick.id, dailyColorRotation: false })
    notify(t('settings.colorChanged', pick.label), { type: 'success' })
  }

  return (
    <Page>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitleFull')} />

      {/* Cài đặt ứng dụng PWA — chỉ hiện khi có thể cài và chưa cài */}
      {canInstall && (
        <Section title={t('settings.installTitle')} subtitle={t('settings.installSubtitle')}>
          <Button size="lg" icon={(p) => <Icon name="install_mobile" {...p} />} onClick={handleInstall} className="w-full sm:w-auto">
            {t('settings.installBtn')}
          </Button>
        </Section>
      )}
      {installed && (
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-chay-container px-5 py-4 text-body-lg text-on-chay-container">
          <Icon name="check_circle" size={24} filled /> {t('settings.installedNote')}
        </div>
      )}

      {/* Chế độ giao diện */}
      <Section title={t('settings.themeModeTitle')} subtitle={t('settings.themeModeSubtitle')}>
        <Segmented
          value={settings.themeMode}
          onChange={(id, e) => withThemeTransition(() => update({ themeMode: id }), e)}
          options={THEME_MODES.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))}
        />
      </Section>

      {/* Ngôn ngữ */}
      <Section title={t('settings.languageTitle')} subtitle={t('settings.languageSubtitle')}>
        <Segmented value={lang} onChange={(id) => update({ language: id })} options={LANGUAGE_OPTIONS.map((l) => ({ id: l.id, label: l.label }))} />
      </Section>

      {/* Màu sắc chủ đề — accordion */}
      <div className="mt-8 sm:mt-10" aria-hidden="true" />
      <Accordion
        icon="palette"
        title={t('settings.colorTitle')}
        subtitle={t('settings.colorSubtitle')}
        summary={
          <>
            {swatch && <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: swatch.primary }} />}
            <span className="truncate">{effectiveColorOption?.label}</span>
          </>
        }
      >
        <div className="flex flex-wrap gap-3.5" role="group" aria-label={t('settings.colorTitle')}>
          {COLOR_OPTIONS.map((c) => {
            const active = !settings.dailyColorRotation && settings.color === c.id
            const scheme = THEME_JSON[c.id][isDark ? 'dark' : 'light']
            return (
              <button
                key={c.id}
                onClick={() => update({ color: c.id, dailyColorRotation: false })}
                className="focus-ring group relative h-12 w-12 rounded-full transition-transform duration-spatial-fast ease-spatial-fast active:scale-90"
                aria-pressed={active}
                aria-label={c.label}
                title={c.label}
              >
                {/* Hình biến từ tròn → cookie khi chọn (cùng số điểm clip-path nên morph được) */}
                <span
                  className="absolute inset-0 block transition-[clip-path,transform] duration-spatial ease-spatial group-hover:scale-105"
                  style={{
                    clipPath: active ? 'var(--shape-cookie)' : 'var(--shape-circle)',
                    background: `linear-gradient(135deg, ${scheme.primary} 0 66%, ${scheme['tertiary-container']} 66% 100%)`
                  }}
                />
                {active && (
                  <Icon name="check" size={26} weight={600} className="animate-pop-in absolute inset-0 m-auto" style={{ color: scheme['on-primary'] }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 border-t border-outline-variant/70">
          <Row
            icon="autorenew"
            title={t('settings.dailyRotationTitle')}
            desc={settings.dailyColorRotation ? t('settings.dailyRotationOn', effectiveColorOption?.label) : t('settings.dailyRotationOff')}
          >
            <Switch checked={settings.dailyColorRotation} onChange={(v) => update({ dailyColorRotation: v })} label={t('settings.dailyRotationTitle')} />
          </Row>
        </div>
        <Button variant="secondary" icon={(p) => <Icon name="shuffle" {...p} />} onClick={handleRandomColor} className="mt-2">
          {t('settings.randomColorNow')}
        </Button>
      </Accordion>

      {/* Phông chữ — accordion (tải trước các font mẫu khi mở lần đầu) */}
      <Accordion
        icon="text_fields"
        title={t('settings.fontTitle')}
        subtitle={t('settings.fontSubtitle')}
        summary={<span className="truncate" style={{ fontFamily: currentFont.stack }}>{currentFont.label}</span>}
        onOpenChange={(open) => open && FONT_OPTIONS.forEach((f) => loadFont(f.id))}
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="group" aria-label={t('settings.fontTitle')}>
          {FONT_OPTIONS.map((f) => {
            const active = settings.fontFamily === f.id
            return (
              <button
                key={f.id}
                onClick={() => update({ fontFamily: f.id })}
                aria-pressed={active}
                className={`state morph-square focus-ring relative flex flex-col items-start gap-1 rounded-3xl p-4 text-left transition-[background-color,color,box-shadow,transform] duration-spatial-fast ease-spatial-fast ${
                  active ? 'bg-primary-container text-on-primary-container shadow-[inset_0_0_0_2px_var(--primary)]' : 'bg-surface-high text-on-surface'
                }`}
              >
                <span className="text-[2rem] font-bold leading-none" style={{ fontFamily: f.stack }}>Aa</span>
                <span className="mt-1 text-label-lg">{f.label}</span>
                <span className="text-body-sm opacity-70">{f.note}</span>
                {active && (
                  <span className="animate-pop-in absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Icon name="check" size={16} weight={700} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <p className="mt-4 rounded-3xl bg-surface-high p-4 text-title-md font-medium text-on-surface" style={{ fontFamily: currentFont.stack }}>
          {t('settings.fontPreviewSample')}
        </p>
      </Accordion>

      {/* Cỡ chữ — 3 mức */}
      <Section title={t('settings.fontSizeTitle')} subtitle={t('settings.fontSizeSubtitle')}>
        <Segmented
          value={settings.fontSize}
          onChange={(id) => update({ fontSize: id })}
          options={FONT_SIZE_OPTIONS.map((s) => ({
            id: s.id,
            label: t(s.labelKey),
            render: (
              <span className="flex items-baseline gap-2">
                <span style={{ fontSize: `${14 * s.scale}px` }} className="font-bold leading-none">Aa</span>
                <span className="text-label-md">{t(s.labelKey)}</span>
              </span>
            )
          }))}
        />
        <p className="mt-4 rounded-3xl bg-surface-high p-4 text-body-md text-on-surface-variant">
          {t('settings.fontSizePreview')} <span className="font-medium text-on-surface">{formatVNDate(PREVIEW_DATE, lang)}</span> {t('settings.fontSizePreviewNote')}
        </p>
      </Section>

      <div className="mt-8 sm:mt-10">
        <Button variant="tertiary" size="lg" icon={(p) => <Icon name="restart_alt" {...p} />} onClick={() => setConfirmResetOpen(true)} className="w-full sm:w-auto">
          {t('settings.resetBtn')}
        </Button>
      </div>

      {/* Thông tin tác giả & Claude AI — khối nổi bật */}
      <Credits t={t} />

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleReset}
        title={t('settings.resetConfirmTitle')}
        message={t('settings.resetConfirmMsg')}
        danger
      />
    </Page>
  )
}

/**
 * Khối ghi công nổi bật: nền màu chủ đạo, hai hình Expressive xoay chậm, hai "nhân vật":
 * tác giả (hình cookie, chữ cái đầu) và Claude AI (hình flower, icon lấp lánh). Có quét sáng khi rê chuột.
 */
function Credits({ t }) {
  return (
    <section className="reveal fx-shine relative mt-8 overflow-hidden rounded-[36px] bg-primary p-6 text-on-primary shadow-fab sm:mt-10 sm:p-8" aria-labelledby="credits-title">
      <span className="fx-spin-slow shape-cookie pointer-events-none absolute -right-16 -top-16 h-56 w-56 bg-primary-container opacity-25" aria-hidden="true" />
      <span className="fx-spin-slower shape-flower pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 bg-tertiary-container opacity-20" aria-hidden="true" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-on-primary/15 px-3.5 py-1.5 text-label-lg backdrop-blur-sm">
          <Icon name="favorite" size={18} filled /> <span id="credits-title">{t('settings.creditsHeading')}</span>
        </span>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <span className="fx-float shape-cookie flex h-16 w-16 shrink-0 items-center justify-center bg-primary-container text-on-primary-container">
              <span className="text-headline-md leading-none">M</span>
            </span>
            <div className="min-w-0">
              <p className="text-headline-sm leading-tight">minhtrong67</p>
              <p className="mt-0.5 text-body-sm opacity-85">{t('settings.creditsAuthorRole')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="fx-float shape-flower flex h-16 w-16 shrink-0 items-center justify-center bg-tertiary-container text-on-tertiary-container [animation-delay:-3s]">
              <Icon name="auto_awesome" size={32} filled />
            </span>
            <div className="min-w-0">
              <p className="text-headline-sm leading-tight">{t('settings.creditsAiName')}</p>
              <p className="mt-0.5 text-body-sm opacity-85">{t('settings.creditsAiRole')}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 border-t border-on-primary/20 pt-4 text-body-md opacity-90">{t('settings.creditsThanks')}</p>
        <p className="mt-1 text-body-sm opacity-75">{t('settings.aboutDesc')}</p>
      </div>
    </section>
  )
}

/** Nhóm cài đặt: tiêu đề màu chủ đạo + thẻ tonal bo 28px (không viền). */
function Section({ title, subtitle, children }) {
  return (
    <section className="reveal mt-8 sm:mt-10">
      <div className="mb-3 px-2">
        <h2 className="text-title-md text-primary">{title}</h2>
        {subtitle && <p className="text-body-sm text-on-surface-variant">{subtitle}</p>}
      </div>
      <div className="rounded-[28px] bg-surface-container p-4 sm:p-6">{children}</div>
    </section>
  )
}

/** Dòng cài đặt: icon trong vòng tonal, dòng chính + dòng phụ, thành phần điều khiển ở cuối. */
function Row({ icon, title, desc, children }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Icon name={icon} size={22} filled />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-body-lg text-on-surface">{title}</p>
        {desc && <p className="text-body-sm text-on-surface-variant">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

/**
 * Connected button group (Expressive): các nút liền nhau cách 2px; mục đang chọn là viên thuốc màu chủ đạo,
 * mục còn lại bo vừa và tonal. Khi đổi chọn, hình dạng và màu "biến hình" bằng spring.
 */
function Segmented({ value, onChange, options }) {
  return (
    <div className="flex gap-0.5" role="group">
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            onClick={(e) => onChange(o.id, e)}
            aria-pressed={active}
            aria-label={o.label}
            className={`state focus-ring flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-2 text-label-lg transition-[border-radius,background-color,color,transform] duration-spatial-fast ease-spatial-fast active:scale-95 ${
              active ? 'rounded-full bg-primary text-on-primary' : 'rounded-xl bg-secondary-container text-on-secondary-container'
            }`}
          >
            {o.render ?? (
              <>
                {o.icon && <Icon name={o.icon} size={20} filled={active} className="hidden min-[360px]:inline-flex" />}
                {o.label}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
