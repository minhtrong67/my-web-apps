import { useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/Button'
import SelectField from '../components/SelectField'
import { Page, PageHeader } from '../components/Page'
import Switch from '../components/Switch'
import ConfirmDialog from '../components/ConfirmDialog'
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
  const { settings, effectiveColor, update, reset } = useSettings()
  const { notify } = useToast()
  const { t, lang } = useTranslation()
  const { permission, requestPermission, supported } = useNotificationPermission()
  const { canInstall, installed, promptInstall } = usePwaInstall()
  const [requesting, setRequesting] = useState(false)
  const [holidayListOpen, setHolidayListOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)

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
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-outline-variant bg-card shadow-soft px-4 py-3 text-body-md text-ink">
          <Icon name="check_circle" size={22} className="text-emerald-600 dark:text-emerald-400" /> {t('settings.installedNote')}
        </div>
      )}

      {/* Chế độ giao diện */}
      <Section title={t('settings.themeModeTitle')} subtitle={t('settings.themeModeSubtitle')}>
        <Segmented
          value={settings.themeMode}
          onChange={(id) => update({ themeMode: id })}
          options={THEME_MODES.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))}
        />
      </Section>

      {/* Ngôn ngữ */}
      <Section title={t('settings.languageTitle')} subtitle={t('settings.languageSubtitle')}>
        <Segmented value={lang} onChange={(id) => update({ language: id })} options={LANGUAGE_OPTIONS.map((l) => ({ id: l.id, label: l.label }))} />
      </Section>

      {/* Màu sắc chủ đề */}
      <Section title={t('settings.colorTitle')} subtitle={t('settings.colorSubtitle')}>
        <div className="flex flex-wrap gap-3" role="group" aria-label={t('settings.colorTitle')}>
          {COLOR_OPTIONS.map((c) => {
            const active = !settings.dailyColorRotation && settings.color === c.id
            return (
              <button
                key={c.id}
                onClick={() => update({ color: c.id, dailyColorRotation: false })}
                className={`focus-ring flex h-10 w-10 items-center justify-center rounded-full transition-shadow ${c.id === 'mono' ? 'text-surface' : 'text-white'}`}
                style={{
                  // "Đơn sắc" theo màu chữ (đen khi sáng, trắng khi tối) để chấm luôn nhìn thấy được trên cả hai nền
                  backgroundColor: c.id === 'mono' ? 'var(--ink)' : c.hex,
                  boxShadow: active
                    ? `0 0 0 2px var(--surface), 0 0 0 4px ${c.id === 'mono' ? 'var(--ink)' : c.hex}`
                    : 'inset 0 0 0 1px var(--outline-variant)'
                }}
                aria-pressed={active}
                aria-label={c.label}
                title={c.label}
              >
                {active && <Icon name="check" size={20} weight={500} />}
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-label-md text-ink-soft">
          {COLOR_OPTIONS.find((c) => c.id === effectiveColor)?.label}
        </p>

        <div className="mt-3 border-t border-outline-variant">
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
        <Button variant="outline" icon={(p) => <Icon name="shuffle" {...p} />} onClick={handleRandomColor} className="mt-3">
          {t('settings.randomColorNow')}
        </Button>
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
        <p className="mt-4 rounded-xl border border-outline-variant bg-card shadow-soft p-4 text-body-md text-ink-soft">
          {t('settings.fontSizePreview')} <span className="font-medium text-ink">{formatVNDate(PREVIEW_DATE, lang)}</span> {t('settings.fontSizePreviewNote')}
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
                <p className="mb-4 flex items-center gap-4 text-body-lg text-ink">
                  <Icon name="schedule" size={22} className="text-ink-soft" />
                  {t('settings.notifyHourTitle')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label={t('common.hour')}
                    labelBg="bg-card"
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
                    labelBg="bg-card"
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
                <p className="mt-3 text-body-sm text-ink-soft">{t('settings.notifyHourNote')}</p>
              </div>

              {/* Chế độ: đúng ngày hay báo trước */}
              <div className="py-5">
                <p className="mb-4 flex items-center gap-4 text-body-lg text-ink">
                  <Icon name="alarm" size={22} className="text-ink-soft" />
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
                          className={`state focus-ring flex h-8 items-center rounded-lg border px-3 text-label-lg ${
                            active ? 'border-transparent bg-primary text-on-primary' : 'border-outline-variant text-ink-soft'
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
                  className="state focus-ring flex w-full items-center gap-4 rounded-xl py-4 text-left"
                  aria-expanded={holidayListOpen}
                >
                  <Icon name="celebration" size={22} className="text-ink-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-lg text-ink">{t('settings.selectHolidaysTitle')}</p>
                    <p className="text-body-sm text-ink-soft">{t('settings.selectedCount', selectedHolidayCount, HOLIDAYS.length)}</p>
                  </div>
                  <Icon name="expand_more" size={22} className={`shrink-0 text-ink-soft transition-transform duration-200 ${holidayListOpen ? 'rotate-180' : ''}`} />
                </button>

                {holidayListOpen && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-outline-variant bg-card shadow-soft">
                    <button
                      onClick={toggleSelectAllHolidays}
                      className="state focus-ring flex w-full items-center gap-4 border-b border-outline-variant px-4 py-3 text-left text-label-lg text-ink"
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
                              className={checked ? 'shrink-0 text-ink' : 'shrink-0 text-ink-soft'}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-body-lg text-ink">{h.name}</span>
                              <span className="block text-body-sm text-ink-soft">{t(`category.${h.category}`)}</span>
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
        <p className="mt-3 text-body-sm text-ink-soft">{t('settings.notifyFootnote')}</p>
      </Section>

      <div className="mt-8 sm:mt-10">
        <Button variant="outline" size="lg" icon={(p) => <Icon name="restart_alt" {...p} />} onClick={() => setConfirmResetOpen(true)} className="w-full sm:w-auto">
          {t('settings.resetBtn')}
        </Button>
      </div>

      {/* Giới thiệu */}
      <Section title={t('settings.aboutTitle')}>
        <p className="text-body-md text-ink-soft">{t('settings.aboutDesc')}</p>
        <p className="mt-3 text-body-sm text-ink-soft">
          {t('settings.aboutDevBy')} <span className="font-medium text-ink">minhtrong67</span>
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

/** Nhóm cài đặt: tiêu đề nhỏ phía trên + thẻ viền mảnh, không tô nền. */
function Section({ title, subtitle, children }) {
  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-3">
        <h2 className="text-title-sm text-primary">{title}</h2>
        {subtitle && <p className="text-body-sm text-ink-soft">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-outline-variant bg-card shadow-soft p-4 sm:p-5">{children}</div>
    </section>
  )
}

/** Dòng cài đặt: icon dẫn đầu, dòng chính + dòng phụ, thành phần điều khiển ở cuối. */
function Row({ icon, title, desc, children }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {icon && <Icon name={icon} size={22} className="shrink-0 text-ink-soft" />}
      <div className="min-w-0 flex-1">
        <p className="text-body-lg text-ink">{title}</p>
        {desc && <p className="text-body-sm text-ink-soft">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

/** Nhóm nút chọn 1: khung viền mảnh, mục đang chọn tô đặc (màu nhấn) để phân biệt rõ cả khi không thấy màu. */
function Segmented({ value, onChange, options }) {
  return (
    <div className="flex gap-0.5 rounded-xl border border-outline-variant p-0.5" role="group">
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`state focus-ring flex h-9 flex-1 items-center justify-center gap-2 rounded-[10px] text-label-lg ${
              active ? 'bg-primary text-on-primary' : 'text-ink-soft'
            }`}
          >
            {o.render ?? (
              <>
                {o.icon && <Icon name={o.icon} size={18} />}
                {o.label}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
