import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react'

/**
 * Window-scroll virtualised grid. Only the rows near the viewport are mounted; the hidden rows are
 * represented by padding on the grid. Column count and row gap are read from the computed CSS grid
 * (so Tailwind breakpoints keep working) and the row height is measured from a real card.
 *
 * Metrics live in a ref (single source of truth) and a reducer only triggers re-renders, so a
 * measurement can never be rolled back by React and cause an update loop.
 *
 * items: any[]   render(item, index, col): ReactNode   className: grid classes
 * measureKey: change it when cards change height (e.g. a selection mode) to re-measure.
 */
export function VirtualGrid({ items, render, className, estimate = 340, overscan = 2, measureKey }) {
  const wrap = useRef(null)
  const grid = useRef(null)
  const metrics = useRef({ cols: 2, rowH: estimate, gap: 12, first: 0, last: 6 })
  const [, bump] = useReducer((n) => n + 1, 0)

  const sync = useCallback(() => {
    const w = wrap.current, g = grid.current
    if (!w || !g) return
    const mt = metrics.current
    const cs = getComputedStyle(g)
    const cols = Math.max(1, cs.gridTemplateColumns.split(' ').filter(Boolean).length)
    const gap = parseFloat(cs.rowGap) || 0
    const el = g.firstElementChild
    // offsetHeight ignores CSS transforms, so the entrance animation can't skew the measurement
    const rowH = el ? el.offsetHeight || estimate : mt.rowH
    const step = rowH + gap
    const rel = -w.getBoundingClientRect().top
    const first = Math.max(0, Math.floor(rel / step) - overscan)
    const last = Math.ceil((rel + window.innerHeight) / step) + overscan
    if (cols !== mt.cols || Math.abs(rowH - mt.rowH) >= 2 || gap !== mt.gap || first !== mt.first || last !== mt.last) {
      metrics.current = { cols, rowH, gap, first, last }
      bump()
    }
  }, [estimate, overscan])

  useLayoutEffect(() => { sync() }, [sync, measureKey, items.length])

  useEffect(() => {
    let raf = 0
    const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync) }
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    const ro = new ResizeObserver(tick)
    if (grid.current) ro.observe(grid.current)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); ro.disconnect() }
  }, [sync])

  const { cols, rowH, gap, first, last } = metrics.current
  const rows = Math.ceil(items.length / cols)
  const startRow = Math.min(first, Math.max(0, rows - 1))
  const endRow = Math.min(rows, Math.max(last, startRow + 1))
  const start = startRow * cols
  const end = Math.min(items.length, endRow * cols)
  const step = rowH + gap

  return (
    <div ref={wrap}>
      <div ref={grid} className={className} style={{ paddingTop: startRow * step, paddingBottom: Math.max(0, (rows - endRow) * step) }} data-virtual-rows={rows}>
        {items.slice(start, end).map((it, k) => render(it, start + k, (start + k) % cols))}
      </div>
    </div>
  )
}
