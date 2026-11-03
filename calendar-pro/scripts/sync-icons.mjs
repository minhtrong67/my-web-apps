#!/usr/bin/env node
/**
 * Đồng bộ danh sách icon Material Symbols trong index.html với code.
 *
 * index.html chỉ tải đúng các icon đang dùng (vài KB thay vì ~4 MB) qua tham số `icon_names=` của Google Fonts,
 * và Google BẮT BUỘC danh sách này theo thứ tự bảng chữ cái. Thiếu một icon thì nó hiện trống mà không báo lỗi,
 * nên script này quét mọi chuỗi trong src/ khớp với tên icon hợp lệ (lấy từ gói material-symbols) rồi ghi lại danh sách.
 *
 *   node scripts/sync-icons.mjs          ghi lại index.html (chạy tự động trước `npm run build`)
 *   node scripts/sync-icons.mjs --check  chỉ kiểm tra, thoát mã 1 nếu danh sách đang lệch
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = process.argv.includes('--check')

// Danh sách tên icon hợp lệ, trích từ bảng ligature của font material-symbols-outlined.woff2 (index.d.ts của gói bị thiếu nhiều icon).
// Tên lạ trong icon_names làm Google Fonts trả lỗi 400 cho CẢ yêu cầu, nên chỉ nhận tên có trong danh sách này.
const VALID = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/material-symbols-names.json'), 'utf8')))

// Những chuỗi trùng tên icon nhưng KHÔNG phải icon (chữ thường gặp: giá trị cấu hình, khoá, tên class...) — bỏ để danh sách gọn
const NOT_ICONS = new Set(['light', 'dark', 'system', 'loading', 'success', 'default', 'button', 'text', 'list', 'none', 'auto', 'center', 'start', 'end', 'top', 'bottom', 'left', 'right', 'block', 'status', 'date', 'time', 'region', 'group', 'image', 'link', 'key', 'sort', 'filter', 'copy', 'paste', 'cut', 'undo', 'redo', 'flip', 'rotate', 'contrast', 'opacity', 'speed', 'category', 'label', 'mood', 'tag', 'article', 'dialog', 'menu_book', 'note', 'page', 'pages', 'lock', 'bolt', 'build', 'bug_report', 'extension', 'face', 'grade', 'history', 'language', 'layers', 'power', 'print', 'report', 'rule', 'send', 'share_location', 'tune', 'upgrade', 'verified', 'visibility', 'work', 'cookie', 'function', 'mouse', 'select', 'storage', 'switch', 'tab'])
const FORCE = new Set(['menu', 'close', 'check', 'search', 'home', 'settings', 'share', 'download', 'add', 'delete', 'edit', 'language', 'translate'])

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(p)
    return /\.(jsx?|mjs)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : []
  })
}

const found = new Set()
for (const file of walk(path.join(ROOT, 'src'))) {
  const src = fs.readFileSync(file, 'utf8')
  for (const m of src.matchAll(/['"`]([a-z][a-z0-9_]*)['"`]/g)) {
    const name = m[1]
    if (VALID.has(name) && (FORCE.has(name) || !NOT_ICONS.has(name))) found.add(name)
  }
}
const names = [...found].sort()

const htmlPath = path.join(ROOT, 'index.html')
const html = fs.readFileSync(htmlPath, 'utf8')
const re = /icon_names=[a-z0-9_,]+&display=block/
if (!re.test(html)) {
  console.error('Không tìm thấy tham số icon_names trong index.html')
  process.exit(1)
}
const next = html.replace(re, `icon_names=${names.join(',')}&display=block`)
if (next === html) {
  console.log(`✔ Danh sách ${names.length} icon đã khớp với code.`)
} else if (CHECK) {
  const cur = new Set(html.match(re)[0].replace('icon_names=', '').replace('&display=block', '').split(','))
  console.error('✘ Danh sách icon trong index.html đang lệch với code.')
  console.error('  Thiếu :', names.filter((n) => !cur.has(n)).join(', ') || '—')
  console.error('  Thừa  :', [...cur].filter((n) => !found.has(n)).join(', ') || '—')
  process.exit(1)
} else {
  fs.writeFileSync(htmlPath, next)
  console.log(`✔ Đã cập nhật index.html với ${names.length} icon.`)
}
