import { useSyncExternalStore } from 'react'

/**
 * Sự kiện cá nhân (sinh nhật, ngày kỷ niệm, ngày giỗ...) — lưu trong localStorage, lặp lại hằng năm theo dương lịch hoặc âm lịch.
 * Mỗi sự kiện: { id, name, type: 'solar' | 'lunar', day, month, year?: năm gốc (để tính tuổi / lần kỷ niệm), icon }
 * Dạng "ngày lễ" (toHoliday) để dùng chung thẻ đếm ngược, đồng hồ và tính ngày kế tiếp với ngày lễ hệ thống.
 */
const KEY = 'calendar-pro:events'
export const MAX_EVENTS = 100
export const EVENT_ICONS = ['CakeSlice', 'Heart', 'PartyPopper', 'GraduationCap', 'Home', 'Baby']

let cache = null
const subs = new Set()

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw.filter(isValid) : []
  } catch {
    return []
  }
}

/** Kiểm tra dữ liệu đọc từ localStorage (có thể bị sửa tay / hỏng) trước khi dùng */
export function isValid(e) {
  return (
    e &&
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    e.name.trim() !== '' &&
    (e.type === 'solar' || e.type === 'lunar') &&
    Number.isInteger(e.day) && e.day >= 1 && e.day <= (e.type === 'lunar' ? 30 : 31) &&
    Number.isInteger(e.month) && e.month >= 1 && e.month <= 12
  )
}

/** Số ngày tối đa của một tháng dương lịch (29 cho tháng 2 để chấp nhận sinh nhật 29/2) */
export function maxDayOf(type, month) {
  if (type === 'lunar') return 30
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31
}

function snapshot() {
  if (cache === null) cache = read()
  return cache
}

function commit(next) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage đầy / bị chặn: vẫn giữ trong bộ nhớ cho phiên hiện tại */
  }
  subs.forEach((cb) => cb())
}

if (typeof window !== 'undefined') {
  // Đồng bộ giữa các tab
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null
      subs.forEach((cb) => cb())
    }
  })
}

const subscribe = (cb) => {
  subs.add(cb)
  return () => subs.delete(cb)
}

export function usePersonalEvents() {
  return useSyncExternalStore(subscribe, snapshot, () => [])
}

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`)

export function saveEvent(input) {
  const list = snapshot()
  const clean = {
    id: input.id ?? newId(),
    name: input.name.trim().slice(0, 60),
    type: input.type,
    day: input.day,
    month: input.month,
    icon: EVENT_ICONS.includes(input.icon) ? input.icon : EVENT_ICONS[0]
  }
  if (Number.isInteger(input.year) && input.year > 1800 && input.year < 2200) clean.year = input.year
  if (!isValid(clean)) return false
  const exists = list.some((e) => e.id === clean.id)
  if (!exists && list.length >= MAX_EVENTS) return false
  commit(exists ? list.map((e) => (e.id === clean.id ? clean : e)) : [...list, clean])
  return true
}

export function removeEvent(id) {
  commit(snapshot().filter((e) => e.id !== id))
}

/** Chuyển sự kiện cá nhân sang dạng "ngày lễ" để dùng chung với thẻ đếm ngược */
export function toHoliday(e) {
  return {
    id: `my-${e.id}`,
    eventId: e.id,
    personal: true,
    name: e.name,
    type: e.type,
    day: e.day,
    month: e.month,
    year: e.year,
    category: 'ca-nhan',
    icon: e.icon ?? 'CakeSlice',
    desc: ''
  }
}

/** Các sự kiện cá nhân rơi vào một ngày dương lịch (cần thông tin âm lịch của ngày đó) */
export function personalOnDate(events, date, lunarInfo) {
  return events.filter((e) =>
    e.type === 'solar'
      ? e.day === date.getDate() && e.month === date.getMonth() + 1
      : e.day === lunarInfo.lunarDay && e.month === lunarInfo.lunarMonth && !lunarInfo.isLeap
  )
}
