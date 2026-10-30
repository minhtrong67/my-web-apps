import { translate as t } from '../i18n'

/**
 * Kiểm tra và làm sạch dữ liệu trước khi ghi vào Firestore.
 * Mọi chuỗi đều được trim, kiểm tra độ dài và định dạng, để dữ liệu sai
 * không bao giờ được lưu vào database (dù nhập từ form hay từ file).
 */

export const LIMITS = {
  title: 100,
  note: 500,
  duration: 100,
  description: 2000,
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Xóa khoảng trắng đầu/cuối và gộp nhiều khoảng trắng liên tiếp thành một (dùng cho trường 1 dòng). */
export function cleanLine(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Xóa khoảng trắng đầu/cuối mỗi dòng và cả đoạn (dùng cho trường nhiều dòng như mô tả, ghi chú). */
export function cleanMultiline(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Ngày hợp lệ dạng YYYY-MM-DD, đúng lịch (không cho phép 2026-02-31) và trong khoảng 1900-2100. */
export function isValidDate(str) {
  const m = DATE_RE.exec(str || '')
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (y < 1900 || y > 2100) return false
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

/** Giờ hợp lệ dạng HH:mm (24 giờ). */
export function isValidTime(str) {
  return TIME_RE.test(str || '')
}

/**
 * Kiểm tra một nhật ký streak.
 * @returns {{ values: object, errors: Record<string,string> }} values đã được làm sạch.
 */
export function validatePost(input) {
  const values = {
    duration: cleanLine(input.duration),
    post_date: String(input.post_date ?? '').trim(),
    post_time: String(input.post_time ?? '').trim().slice(0, 5),
    description: cleanMultiline(input.description),
  }
  const errors = {}

  if (!values.duration) errors.duration = t('validation.durationRequired')
  else if (values.duration.length > LIMITS.duration)
    errors.duration = t('validation.durationMax', { max: LIMITS.duration })

  if (!values.post_date) errors.date = t('validation.dateRequired')
  else if (!isValidDate(values.post_date)) errors.date = t('validation.dateInvalid')

  if (!values.post_time) errors.time = t('validation.timeRequired')
  else if (!isValidTime(values.post_time)) errors.time = t('validation.timeInvalid')

  if (values.description.length > LIMITS.description)
    errors.description = t('validation.descriptionMax', { max: LIMITS.description })

  values.description = values.description || null
  return { values, errors }
}

/**
 * Kiểm tra mốc thời gian.
 * `startAtLocal` là giá trị của input datetime-local (YYYY-MM-DDTHH:mm).
 */
export function validateTimeStreak(input) {
  const values = {
    title: cleanLine(input.title),
    start_at: '',
    note: cleanMultiline(input.note),
  }
  const errors = {}

  if (!values.title) errors.title = t('validation.titleRequired')
  else if (values.title.length > LIMITS.title) errors.title = t('validation.titleMax', { max: LIMITS.title })

  const parsed = input.startAtLocal ? new Date(input.startAtLocal) : null
  if (!input.startAtLocal) errors.startAt = t('validation.startRequired')
  else if (Number.isNaN(parsed?.getTime())) errors.startAt = t('validation.startInvalid')
  else if (parsed.getFullYear() < 1900 || parsed.getFullYear() > 2100)
    errors.startAt = t('validation.startRange')
  else values.start_at = parsed.toISOString()

  if (values.note.length > LIMITS.note) errors.note = t('validation.noteMax', { max: LIMITS.note })

  values.note = values.note || null
  return { values, errors }
}

/** Lấy thông báo lỗi đầu tiên để hiển thị toast. */
export function firstError(errors) {
  return Object.values(errors)[0] || null
}
