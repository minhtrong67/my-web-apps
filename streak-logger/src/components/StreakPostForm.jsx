import { useEffect, useRef, useState } from 'react'
import { Check, NotebookPen, Save, X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { LIMITS, cleanLine, cleanMultiline, firstError, validatePost } from '../utils/validation'
import { toDateTimeLocalValue } from '../utils/date'
import Field from './ui/Field'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import Sheet from './ui/Sheet'
import ConfirmDialog from './ui/ConfirmDialog'

const FORM_ID = 'streak-post-form'

/**
 * Form thêm / sửa nhật ký streak. Nhiều trường (thời lượng, ngày, giờ, mô tả dài) nên
 * dùng sheet toàn màn hình. Khi sửa phải qua hộp thoại xác nhận cập nhật.
 */
export default function StreakPostForm({ open, onClose, onSubmit, initial }) {
  const { t } = useLang()
  const toast = useToast()
  const [duration, setDuration] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const pending = useRef(null)

  // Đồng bộ lại các trường mỗi lần mở.
  useEffect(() => {
    if (!open) return
    setDuration(initial?.duration || '')
    setDateTime(initial?.post_date ? `${initial.post_date}T${(initial.post_time || '00:00').slice(0, 5)}` : toDateTimeLocalValue(new Date()))
    setDescription(initial?.description || '')
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
    // Một ô ngày giờ duy nhất, tách lại thành ngày và giờ để lưu và kiểm tra.
    const [date = '', time = ''] = dateTime.split('T')
    const { values, errors: nextErrors } = validatePost({ duration, post_date: date, post_time: time, description })
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
      // Toast lỗi đã được hiển thị ở trang cha, giữ nguyên sheet để người dùng sửa lại.
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={saving ? () => {} : onClose}
        title={initial ? t('streakPost.editTitle') : t('streakPost.addTitle')}
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
            <NotebookPen size={26} />
          </span>
          <p className="text-sm text-[var(--md-on-surface-variant)]">{t('streakPost.subtitle')}</p>
        </div>
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <Field label={t('streakPost.fieldDuration')} required error={errors.duration}>
            <Input
              value={duration}
              maxLength={LIMITS.duration}
              aria-invalid={!!errors.duration}
              onChange={(e) => setDuration(e.target.value)}
              onBlur={() => setDuration(cleanLine(duration))}
              placeholder={t('streakPost.fieldDurationPlaceholder')}
              autoFocus
            />
          </Field>
          <Field label={t('streakPost.fieldDateTime')} required error={errors.date || errors.time}>
            <Input
              type="datetime-local"
              value={dateTime}
              min="1900-01-01T00:00"
              max="2100-12-31T23:59"
              aria-invalid={!!(errors.date || errors.time)}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </Field>
          <Field label={`${t('streakPost.fieldDescription')} (${t('common.optional')})`} error={errors.description}>
            <Textarea
              value={description}
              maxLength={LIMITS.description}
              aria-invalid={!!errors.description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setDescription(cleanMultiline(description))}
              placeholder={t('streakPost.fieldDescriptionPlaceholder')}
              rows={8}
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
