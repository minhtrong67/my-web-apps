import { useEffect, useRef, useState } from 'react'

/** Ngăn xếp các lớp phủ đang mở (hộp thoại, sheet, menu). Chỉ lớp trên cùng phản ứng với phím Escape. */
const stack = []
let lockCount = 0
let previousOverflow = ''

function lockScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) document.body.style.overflow = previousOverflow
}

/**
 * Quản lý một lớp phủ: khóa cuộn trang (đếm số lớp nên mở chồng nhiều lớp không bị lỗi),
 * đóng bằng Escape chỉ ở lớp trên cùng, và trả focus về phần tử trước đó khi đóng.
 */
export function useOverlay(open, onClose) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined
    const id = Symbol('overlay')
    stack.push(id)
    lockScroll()
    const previouslyFocused = document.activeElement

    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id) {
        e.stopPropagation()
        closeRef.current?.()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      const index = stack.indexOf(id)
      if (index >= 0) stack.splice(index, 1)
      unlockScroll()
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [open])
}

/**
 * Giữ phần tử trong DOM thêm một khoảng sau khi `open` chuyển sang false để chạy
 * animation đóng. Trả về `mounted` (có render hay không) và `closing` (đang chạy animation đóng).
 */
export function usePresence(open, duration = 220) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
      return undefined
    }
    if (!mounted) return undefined
    setClosing(true)
    const timer = setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [open, duration, mounted])

  return { mounted: mounted || open, closing: closing && !open }
}
