import { useEffect, useRef, useState } from 'react'
import { Check, Hourglass, Save, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { toDateTimeLocalValue } from '../utils/date'
import { LIMITS, cleanLine, cleanMultiline, firstError, validateTimeStreak } from '../utils/validation'
import Field from './ui/Field'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Sheet from './ui/Sheet'
import ConfirmDialog from './ui/ConfirmDialog'

const FORM_ID = 'time-streak-form'

/**
 * Form thiết lập / sửa mốc thời gian (ít trường nên dùng hộp thoại).
 * Dữ liệu được trim và kiểm tra trước khi lưu; khi sửa phải qua hộp thoại xác nhận cập nhật.
 */
export default function TimeStreakForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const pending = useRef(null)

  // Đồng bộ lại các trường mỗi lần mở để luôn hiển thị đúng dữ liệu hiện tại.
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title || '')
    setStartAt(toDateTimeLocalValue(initial ? initial.start_at : new Date()))
    setNote(initial?.note || '')
    setErrors({})
    setConfirmOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const persist = async (values) => {
    setSaving(true)
    try {
      await onSubmit(values)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const { values, errors: nextErrors } = validateTimeStreak({ title, startAtLocal: startAt, note })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      toast.error(firstError(nextErrors) || t('toast.invalid'))
      return
    }
    if (initial) {
      pending.current = values
      setConfirmOpen(true) // sửa dữ liệu có sẵn: luôn hỏi xác nhận
      return
    }
    try {
      await persist(values)
    } catch {
      // Toast lỗi đã được hiển thị ở trang cha, giữ nguyên hộp thoại để người dùng sửa lại.
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={saving ? () => {} : onClose}
        title={initial ? t('timeStreak.editTitle') : t('timeStreak.addTitle')}
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={onClose} disabled={saving} size="lg">
              {t('common.cancel')}
            </Button>
            <Button type="submit" form={FORM_ID} icon={initial ? Save : Check} loading={saving} size="lg">
              {initial ? t('common.update') : t('common.save')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-14 h-14 rounded-[20px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] flex items-center justify-center shrink-0">
            <Hourglass size={26} />
          </span>
          <p className="text-sm text-[var(--md-on-surface-variant)]">{t('timeStreak.subtitle')}</p>
        </div>
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <Field label={t('timeStreak.fieldTitle')} required error={errors.title}>
            <Input
              value={title}
              maxLength={LIMITS.title}
              aria-invalid={!!errors.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitle(cleanLine(title))}
              placeholder={t('timeStreak.fieldTitlePlaceholder')}
              autoFocus
            />
          </Field>
          <Field label={t('timeStreak.fieldStart')} required error={errors.startAt}>
            <Input type="datetime-local" value={startAt} aria-invalid={!!errors.startAt} onChange={(e) => setStartAt(e.target.value)} />
          </Field>
          <Field label={`${t('timeStreak.fieldNote')} (${t('common.optional')})`} error={errors.note}>
            <Textarea
              value={note}
              maxLength={LIMITS.note}
              aria-invalid={!!errors.note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => setNote(cleanMultiline(note))}
              placeholder={t('timeStreak.fieldNotePlaceholder')}
              rows={5}
            />
          </Field>
        </form>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => persist(pending.current)}
        title={t('common.updateConfirmTitle')}
        body={t('common.updateConfirmBody')}
        confirmLabel={t('common.update')}
        confirmIcon={Save}
        tone="primary"
      />
    </>
  )
}
