import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/Button'
import SelectField from '../components/SelectField'
import { Page, PageHeader } from '../components/Page'
import Switch from '../components/Switch'
import ConfirmDialog from '../components/ConfirmDialog'
import { FONT_OPTIONS, getFont, loadFont } from '../lib/fonts'
import { withThemeTransition } from '../lib/themeTransition'
import THEME_JSON from '../theme/swatches.json'
import { useSettings, COLOR_OPTIONS, LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from '../contexts/SettingsContext'
import { useToast } from '../contexts/ToastContext'
import { useNotificationPermission } from '../hooks/useReminders'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { HOLIDAYS } from '../data/holidays'
import { pad2, formatVNDate } from '../lib/dateUtils'
import { useTranslation } from '../i18n/useTranslation'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const BEFORE_DAYS_OPTIONS = [1, 2, 3, 5, 7]
const PREVIEW_DATE = new Date(2026, 7, 7) // 07/08/2026 — cố định để bản xem trước cỡ chữ luôn nhất quán

export default function SettingsPage() {
  const { settings, effectiveColor, isDark, update, reset } = useSettings()
  const { notify } = useToast()
  const { t, lang } = useTranslation()
  const { permission, requestPermission, supported } = useNotificationPermission()
  const { canInstall, installed, promptInstall } = usePwaInstall()
  const [requesting, setRequesting] = useState(false)
  const [holidayListOpen, setHolidayListOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

  // Mục "Phông chữ" hiển thị mẫu bằng chính từng font → tải sẵn các font web (mỗi font vài chục KB, chỉ khi mở trang này)
  useEffect(() => {
    FONT_OPTIONS.forEach((f) => loadFont(f.id))
  }, [])

  const THEME_MODES = [
    { id: 'light', label: t('settings.light'), icon: 'light_mode' },
    { id: 'dark', label: t('settings.dark'), icon: 'dark_mode' },
    { id: 'system', label: t('settings.system'), icon: 'devices' }
  ]

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

  async function handleToggleNotifications(next) {
    if (next) {
      setRequesting(true)
      const result = await requestPermission()
      setRequesting(false)
      if (result !== 'granted') {
        notify(t('settings.notifyDeniedMsg'), { type: 'warning', title: t('settings.notifyDeniedTitle') })
        return
      }
      notify(t('settings.notifyEnabledMsg'), { type: 'success', title: t('settings.notifyEnabledTitle') })
    }
    update({ notificationsEnabled: next })
  }

  function handleRandomColor() {
    const others = COLOR_OPTIONS.filter((c) => c.id !== settings.color)
    const pick = others[Math.floor(Math.random() * others.length)] ?? COLOR_OPTIONS[0]
    update({ color: pick.id, dailyColorRotation: false })
    notify(t('settings.colorChanged', pick.label), { type: 'success' })
  }

  const permissionLabel = !supported
    ? t('settings.notifyUnsupported')
    : permission === 'granted'
      ? t('settings.notifyGranted')
      : permission === 'denied'
        ? t('settings.notifyDenied')
        : t('settings.notifyDefault')

  const selectedHolidayCount = settings.notifyHolidayIds.length
  const allHolidaysSelected = selectedHolidayCount === HOLIDAYS.length

  function toggleHoliday(id) {
    const set = new Set(settings.notifyHolidayIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    update({ notifyHolidayIds: Array.from(set) })
  }

  function toggleSelectAllHolidays() {
    update({ notifyHolidayIds: allHolidaysSelected ? [] : HOLIDAYS.map((h) => h.id) })
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

      {/* Màu sắc chủ đề */}
      <Section title={t('settings.colorTitle')} subtitle={t('settings.colorSubtitle')}>
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
                  <Icon
                    name="check"
                    size={26}
                    weight={600}
                    className="animate-pop-in absolute inset-0 m-auto"
                    style={{ color: scheme['on-primary'] }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-label-lg text-on-surface-variant">
          {COLOR_OPTIONS.find((c) => c.id === effectiveColor)?.label}
        </p>

        <div className="mt-3 border-t border-outline-variant/70">
          <Row
            icon="autorenew"
            title={t('settings.dailyRotationTitle')}
            desc={
              settings.dailyColorRotation
                ? t('settings.dailyRotationOn', COLOR_OPTIONS.find((c) => c.id === effectiveColor)?.label)
                : t('settings.dailyRotationOff')
            }
          >
            <Switch checked={settings.dailyColorRotation} onChange={(v) => update({ dailyColorRotation: v })} label={t('settings.dailyRotationTitle')} />
          </Row>
        </div>
        <Button variant="secondary" icon={(p) => <Icon name="shuffle" {...p} />} onClick={handleRandomColor} className="mt-3">
          {t('settings.randomColorNow')}
        </Button>
      </Section>

      {/* Phông chữ */}
      <Section title={t('settings.fontTitle')} subtitle={t('settings.fontSubtitle')}>
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
        <p className="mt-4 rounded-3xl bg-surface-high p-4 text-title-md font-medium text-on-surface" style={{ fontFamily: getFont(settings.fontFamily).stack }}>
          {t('settings.fontPreviewSample')}
        </p>
      </Section>

      {/* Cỡ chữ */}
      <Section title={t('settings.fontSizeTitle')} subtitle={t('settings.fontSizeSubtitle')}>
        <Segmented
          value={settings.fontSize}
          onChange={(id) => update({ fontSize: id })}
          options={FONT_SIZE_OPTIONS.map((s) => ({
            id: s.id,
            label: s.label,
            render: (
              <span className="flex items-baseline gap-1.5">
                <span style={{ fontSize: `${14 * s.scale}px` }} className="leading-none">Aa</span>
                <span className="hidden text-label-md sm:inline">{s.label}</span>
              </span>
            )
          }))}
        />
        <p className="mt-4 rounded-3xl bg-surface-high p-4 text-body-md text-on-surface-variant">
          {t('settings.fontSizePreview')} <span className="font-medium text-on-surface">{formatVNDate(PREVIEW_DATE, lang)}</span> {t('settings.fontSizePreviewNote')}
        </p>
      </Section>

      {/* Thông báo */}
      <Section title={t('settings.notifyTitle')} subtitle={t('settings.notifySubtitle')}>
        <div className="divide-y divide-outline-variant">
          <Row icon="notifications" title={t('settings.notifyEnable')} desc={requesting ? t('settings.notifyRequesting') : permissionLabel}>
            <Switch
              checked={settings.notificationsEnabled}
              onChange={handleToggleNotifications}
              label={t('settings.notifyEnable')}
              disabled={requesting || !supported}
            />
          </Row>

          {settings.notificationsEnabled && (
            <>
              {/* Giờ thông báo */}
              <div className="py-5">
                <p className="mb-4 flex items-center gap-4 text-body-lg text-on-surface">
                  <Icon name="schedule" size={22} className="text-on-surface-variant" />
                  {t('settings.notifyHourTitle')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label={t('common.hour')}
                    value={settings.notifyHour}
                    onChange={(e) => update({ notifyHour: Number(e.target.value) })}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {pad2(h)}:00
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label={t('common.minute')}
                    value={settings.notifyMinute}
                    onChange={(e) => update({ notifyMinute: Number(e.target.value) })}
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        :{pad2(m)}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <p className="mt-3 text-body-sm text-on-surface-variant">{t('settings.notifyHourNote')}</p>
              </div>

              {/* Chế độ: đúng ngày hay báo trước */}
              <div className="py-5">
                <p className="mb-4 flex items-center gap-4 text-body-lg text-on-surface">
                  <Icon name="alarm" size={22} className="text-on-surface-variant" />
                  {t('settings.notifyTimingTitle')}
                </p>
                <Segmented
                  value={settings.notifyTiming}
                  onChange={(id) => update({ notifyTiming: id })}
                  options={[
                    { id: 'on-day', label: t('settings.onDay') },
                    { id: 'before', label: t('settings.before') }
                  ]}
                />
                {settings.notifyTiming === 'before' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {BEFORE_DAYS_OPTIONS.map((d) => {
                      const active = settings.notifyBeforeDays === d
                      return (
                        <button
                          key={d}
                          onClick={() => update({ notifyBeforeDays: d })}
                          aria-pressed={active}
                          className={`state focus-ring flex h-10 items-center rounded-full px-4 text-label-lg transition-[background-color,color,box-shadow] duration-spatial-fast ease-spatial-fast active:scale-95 ${
                            active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant shadow-[inset_0_0_0_1px_var(--outline-variant)]'
                          }`}
                        >
                          {t('settings.beforeDays', d)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Ngày chay / rằm / mùng một */}
              <Row icon="eco" title={t('settings.vegetarianReminderTitle')} desc={t('settings.vegetarianReminderDesc')}>
                <Switch checked={settings.notifyLunarDays} onChange={(v) => update({ notifyLunarDays: v })} label={t('settings.vegetarianReminderTitle')} />
              </Row>

              {/* Danh sách ngày lễ tuỳ chọn */}
              <div>
                <button
                  onClick={() => setHolidayListOpen((v) => !v)}
                  className="state focus-ring flex w-full items-center gap-4 rounded-2xl py-4 text-left"
                  aria-expanded={holidayListOpen}
                >
                  <Icon name="celebration" size={22} className="text-on-surface-variant" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-lg text-on-surface">{t('settings.selectHolidaysTitle')}</p>
                    <p className="text-body-sm text-on-surface-variant">{t('settings.selectedCount', selectedHolidayCount, HOLIDAYS.length)}</p>
                  </div>
                  <Icon name="expand_more" size={22} className={`shrink-0 text-on-surface-variant transition-transform duration-200 ${holidayListOpen ? 'rotate-180' : ''}`} />
                </button>

                {holidayListOpen && (
                  <div className="mb-4 overflow-hidden rounded-3xl bg-surface-high">
                    <button
                      onClick={toggleSelectAllHolidays}
                      className="state focus-ring flex w-full items-center gap-4 border-b border-outline-variant/60 px-4 py-3.5 text-left text-label-lg text-on-surface"
                    >
                      <Icon name={allHolidaysSelected ? 'check_box' : 'check_box_outline_blank'} size={24} filled={allHolidaysSelected} />
                      {allHolidaysSelected ? t('settings.deselectAll') : t('settings.selectAll')}
                    </button>
                    <div className="max-h-72 overflow-y-auto">
                      {HOLIDAYS.map((h) => {
                        const checked = settings.notifyHolidayIds.includes(h.id)
                        return (
                          <button
                            key={h.id}
                            onClick={() => toggleHoliday(h.id)}
                            className="state focus-ring flex w-full items-center gap-4 px-4 py-2.5 text-left"
                            aria-pressed={checked}
                          >
                            <Icon
                              name={checked ? 'check_box' : 'check_box_outline_blank'}
                              size={24}
                              filled={checked}
                              className={checked ? 'shrink-0 text-on-surface' : 'shrink-0 text-on-surface-variant'}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-body-lg text-on-surface">{h.name}</span>
                              <span className="block text-body-sm text-on-surface-variant">{t(`category.${h.category}`)}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-3 text-body-sm text-on-surface-variant">{t('settings.notifyFootnote')}</p>
      </Section>

      <div className="mt-8 sm:mt-10">
        <Button variant="tertiary" size="lg" icon={(p) => <Icon name="restart_alt" {...p} />} onClick={() => setConfirmResetOpen(true)} className="w-full sm:w-auto">
          {t('settings.resetBtn')}
        </Button>
      </div>

      {/* Giới thiệu */}
      <Section title={t('settings.aboutTitle')}>
        <p className="text-body-md text-on-surface-variant">{t('settings.aboutDesc')}</p>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          {t('settings.aboutDevBy')} <span className="font-medium text-on-surface">minhtrong67</span>
        </p>
      </Section>

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
            className={`state focus-ring flex h-12 flex-1 items-center justify-center gap-2 text-label-lg transition-[border-radius,background-color,color,transform] duration-spatial-fast ease-spatial-fast active:scale-95 ${
              active ? 'rounded-full bg-primary text-on-primary' : 'rounded-xl bg-secondary-container text-on-secondary-container'
            }`}
          >
            {o.render ?? (
              <>
                {o.icon && <Icon name={o.icon} size={20} filled={active} />}
                {o.label}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
