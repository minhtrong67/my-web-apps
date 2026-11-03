import { useCallback, useMemo, useState } from 'react'
import CountdownCard from '../components/CountdownCard'
import Icon from '../components/Icon'
import Sheet from '../components/Sheet'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EventForm from '../components/EventForm'
import HolidayDetail from '../components/HolidayDetail'
import { Page, PageHeader } from '../components/Page'
import { HOLIDAYS, CATEGORY_LABEL } from '../data/holidays'
import { getNextOccurrence } from '../lib/dateUtils'
import { removeEvent, toHoliday, usePersonalEvents } from '../lib/personalEvents'
import { useNow } from '../hooks/useNow'
import { useToast } from '../contexts/ToastContext'
import { useTranslation } from '../i18n/useTranslation'

export default function CountdownPage() {
  const { t } = useTranslation()
  const { notify } = useToast()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(null) // null = đóng · {} = thêm mới · {event} = sửa
  const [confirmDelete, setConfirmDelete] = useState(null)
  const events = usePersonalEvents()

  // "Hôm nay" tự cập nhật khi qua nửa đêm (useNow chỉ đổi giá trị theo phút; danh sách chỉ tính lại khi sang ngày mới)
  const now = useNow(60000)
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const today = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const FILTERS = useMemo(
    () => [{ id: 'all', label: t('countdown.filterAll') }, ...Object.keys(CATEGORY_LABEL).map((id) => ({ id, label: t(`category.${id}`) }))],
    [t]
  )

  // Tính ngày diễn ra kế tiếp 1 lần; đổi bộ lọc chỉ lọc lại danh sách
  const all = useMemo(
    () =>
      [...HOLIDAYS, ...events.map(toHoliday)]
        .map((h) => ({ holiday: h, next: getNextOccurrence(h, today) }))
        .filter((x) => x.next)
        .sort((a, b) => a.next - b.next),
    [today, events]
  )
  const items = useMemo(() => (filter === 'all' ? all : all.filter((x) => x.holiday.category === filter)), [all, filter])

  const openHoliday = useCallback((holiday, next) => setSelected({ holiday, next }), [])
  const closeHoliday = useCallback(() => setSelected(null), [])

  function editSelected() {
    const ev = events.find((e) => e.id === selected.holiday.eventId)
    setSelected(null)
    if (ev) setForm({ event: ev })
  }

  function confirmRemove() {
    removeEvent(confirmDelete.eventId)
    setConfirmDelete(null)
    notify(t('events.deleted'), { type: 'success' })
  }

  return (
    <Page wide>
      <PageHeader title={t('countdown.title')} subtitle={t('countdown.desc')}>
        <Button icon={(p) => <Icon name="add" {...p} />} onClick={() => setForm({})} className="hidden sm:inline-flex">
          {t('countdown.addEvent')}
        </Button>
      </PageHeader>

      {/* Bộ lọc danh mục */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0" role="group">
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={`state focus-ring flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-label-lg transition-[background-color,color,border-radius,box-shadow] duration-spatial-fast ease-spatial-fast active:scale-95 ${
                active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant shadow-[inset_0_0_0_1px_var(--outline-variant)]'
              }`}
            >
              {active && <Icon name="check" size={18} weight={600} className="animate-pop-in" />}
              {f.label}
            </button>
          )
        })}
      </div>

      <section className="mt-4 sm:mt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface-container p-10 text-center">
            <p className="max-w-md text-body-md text-on-surface-variant">{filter === 'ca-nhan' ? t('countdown.emptyMine') : t('countdown.empty')}</p>
            {filter === 'ca-nhan' && (
              <Button variant="secondary" icon={(p) => <Icon name="add" {...p} />} onClick={() => setForm({})}>
                {t('countdown.addEvent')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {items.map(({ holiday, next }, i) => (
              <CountdownCard key={holiday.id} holiday={holiday} nextDate={next} index={i} onSelect={openHoliday} />
            ))}
          </div>
        )}
        {events.length > 0 && <p className="mt-4 px-1 text-body-sm text-on-surface-variant">{t('countdown.mineHint')}</p>}
      </section>

      {/* FAB thêm sự kiện (di động, chỉ icon, góc phải; trên máy tính dùng nút ở tiêu đề) */}
      <button
        onClick={() => setForm({})}
        className="state morph-square focus-ring animate-pop-in fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-container text-on-primary-container shadow-fab sm:hidden"
        aria-label={t('countdown.addEvent')}
        title={t('countdown.addEvent')}
      >
        <Icon name="add" size={28} weight={500} />
      </button>

      <Sheet fullScreen open={!!selected} onClose={closeHoliday} title={t('countdown.eventDetail')}>
        {selected && (
          <HolidayDetail
            holiday={selected.holiday}
            nextDate={selected.next}
            onEdit={selected.holiday.personal ? editSelected : undefined}
            onDelete={selected.holiday.personal ? () => { setConfirmDelete(selected.holiday); setSelected(null) } : undefined}
          />
        )}
      </Sheet>

      <Sheet open={!!form} onClose={() => setForm(null)} title={form?.event ? t('events.editTitle') : t('events.newTitle')}>
        {form && <EventForm initial={form.event} onDone={() => setForm(null)} onCancel={() => setForm(null)} />}
      </Sheet>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmRemove}
        title={t('events.deleteTitle')}
        message={confirmDelete ? t('events.deleteBody', confirmDelete.name) : ''}
        danger
      />
    </Page>
  )
}
