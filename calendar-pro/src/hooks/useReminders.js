import { useCallback, useEffect, useState } from 'react'
import { HOLIDAYS, NGAY_CHAY_NHI_TRAI } from '../data/holidays'
import { localizedHoliday } from '../data/holidayI18n'
import { getLunarInfo, getNextOccurrence, sameDay, startOfDay, addDays, formatShortDate } from '../lib/dateUtils'

const LAST_NOTIFIED_KEY = 'calendar-pro:last-notified-date'

export function getNotificationSupport() {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Tính "ngày cần kiểm tra" dựa theo chế độ thông báo:
 * - 'on-day': kiểm tra ngay hôm nay
 * - 'before': kiểm tra ngày trong tương lai (hôm nay + N ngày) — nếu ngày đó là sự kiện đặc biệt
 *             thì báo trước ngay hôm nay.
 */
function getCheckDate(today, timing, beforeDays) {
  return timing === 'before' ? addDays(today, Math.max(1, beforeDays || 1)) : today
}

/** Kiểm tra ngày cần theo dõi có sự kiện đặc biệt gì hay không, có lọc theo tuỳ chọn người dùng. */
export function getReminders(from = new Date(), prefs = {}) {
  const notifyLunarDays = prefs.notifyLunarDays ?? true
  const notifyHolidayIds = prefs.notifyHolidayIds ?? HOLIDAYS.map((h) => h.id)
  const timing = prefs.notifyTiming ?? 'on-day'
  const beforeDays = prefs.notifyBeforeDays ?? 1
  const lang = prefs.lang === 'en' ? 'en' : 'vi'

  const today = startOfDay(from)
  const checkDate = getCheckDate(today, timing, beforeDays)
  const isBefore = timing === 'before'
  const messages = []

  if (notifyLunarDays) {
    const { lunarDay } = getLunarInfo(checkDate)
    if (NGAY_CHAY_NHI_TRAI.includes(lunarDay)) {
      const name = lang === 'en' ? (lunarDay === 1 ? 'the 1st' : 'the full moon') : lunarDay === 1 ? 'Mùng Một' : 'Ngày Rằm'
      messages.push(
        lang === 'en'
          ? {
              title: isBefore ? `Coming up: ${name} (lunar)` : `Today is ${name} (lunar)`,
              body: isBefore
                ? `${beforeDays} day(s) until ${name} (${formatShortDate(checkDate)}) — a traditional vegetarian day.`
                : 'Traditional vegetarian day (1st & 15th of the lunar month).'
            }
          : {
              title: isBefore ? `Sắp tới: ${name} âm lịch` : `Hôm nay là ${name} âm lịch`,
              body: isBefore
                ? `Còn ${beforeDays} ngày nữa là đến ${name.toLowerCase()} (${formatShortDate(checkDate)}) — ngày ăn chay truyền thống.`
                : 'Ngày ăn chay truyền thống theo Nhị trai (Mùng Một & Rằm).'
            }
      )
    }
  }

  for (const h of HOLIDAYS) {
    if (!notifyHolidayIds.includes(h.id)) continue
    const next = getNextOccurrence(h, today)
    if (next && sameDay(next, checkDate)) {
      const { name: hName, desc: hDesc } = localizedHoliday(h, lang)
      messages.push(
        lang === 'en'
          ? {
              title: isBefore ? `Coming up: ${hName}` : `Today: ${hName}`,
              body: isBefore ? `${beforeDays} day(s) left (${formatShortDate(next)}). ${hDesc}` : hDesc
            }
          : {
              title: isBefore ? `Sắp tới: ${hName}` : `Hôm nay: ${hName}`,
              body: isBefore ? `Còn ${beforeDays} ngày nữa (${formatShortDate(next)}). ${hDesc}` : hDesc
            }
      )
    }
  }

  return messages
}

/** Trạng thái quyền thông báo trình duyệt + hàm yêu cầu quyền. */
export function useNotificationPermission() {
  const [permission, setPermission] = useState(() => (getNotificationSupport() ? Notification.permission : 'unsupported'))

  const requestPermission = useCallback(async () => {
    if (!getNotificationSupport()) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  return { permission, requestPermission, supported: getNotificationSupport() }
}

/**
 * Bộ đếm nền: kiểm tra định kỳ, khi đến/qua khung giờ đã đặt trong ngày (và chưa báo hôm nay)
 * thì gửi thông báo. Chỉ nên mount 1 lần ở Layout gốc.
 */
export function useReminders(enabled, prefs = {}) {
  const notifyLunarDays = prefs.notifyLunarDays ?? true
  const notifyHolidayIds = prefs.notifyHolidayIds ?? HOLIDAYS.map((h) => h.id)
  const notifyHour = prefs.notifyHour ?? 8
  const notifyMinute = prefs.notifyMinute ?? 0
  const notifyTiming = prefs.notifyTiming ?? 'on-day'
  const notifyBeforeDays = prefs.notifyBeforeDays ?? 1
  const lang = prefs.lang === 'en' ? 'en' : 'vi'
  const holidayIdsKey = notifyHolidayIds.join(',')

  const checkAndNotify = useCallback(() => {
    if (!enabled || !getNotificationSupport() || Notification.permission !== 'granted') return
    const now = new Date()
    const todayKey = startOfDay(now).toISOString().slice(0, 10)
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY)
    if (lastNotified === todayKey) return

    const targetTimeToday = new Date(now)
    targetTimeToday.setHours(notifyHour, notifyMinute, 0, 0)
    if (now < targetTimeToday) return // chưa tới giờ đã hẹn trong ngày

    const reminders = getReminders(now, { notifyLunarDays, notifyHolidayIds, notifyTiming, notifyBeforeDays, lang })
    if (reminders.length > 0) {
      reminders.slice(0, 3).forEach((r, idx) => {
        setTimeout(() => {
          try {
            new Notification(r.title, { body: r.body, icon: '/icons/icon-192.png', tag: `calendar-pro-${todayKey}-${idx}` })
          } catch {
            /* trình duyệt có thể chặn tạo Notification trực tiếp trên một số nền tảng di động */
          }
        }, idx * 400)
      })
    }
    localStorage.setItem(LAST_NOTIFIED_KEY, todayKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, notifyLunarDays, holidayIdsKey, notifyHour, notifyMinute, notifyTiming, notifyBeforeDays, lang])

  useEffect(() => {
    checkAndNotify()
    const id = setInterval(checkAndNotify, 60 * 1000)
    return () => clearInterval(id)
  }, [checkAndNotify])
}
