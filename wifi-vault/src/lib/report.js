// Xuất báo cáo thống kê ra PDF hoặc PNG.
// Báo cáo được dựng thành một khối HTML riêng (màu cố định, nền sáng) rồi chụp bằng html2canvas, nên
// luôn đẹp, dễ in và không phụ thuộc chế độ sáng/tối hay kích thước màn hình. Dùng font hệ thống (system-ui) nên tiếng Việt không lỗi.
import { download, stamp } from './fileIO';
import { ACCENTS } from './colors';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const W = 900; // chiều rộng khối báo cáo (px)

const LOGO = `<svg width="48" height="48" viewBox="0 0 64 64"><path d="M32.00 0.00 L33.11 0.09 L34.21 0.34 L35.29 0.74 L36.32 1.25 L37.32 1.84 L38.28 2.46 L39.21 3.07 L40.13 3.64 L41.06 4.12 L42.00 4.52 L42.98 4.82 L44.00 5.04 L45.07 5.21 L46.18 5.34 L47.31 5.48 L48.45 5.67 L49.58 5.94 L50.65 6.32 L51.66 6.84 L52.57 7.49 L53.37 8.27 L54.05 9.17 L54.61 10.17 L55.07 11.22 L55.46 12.32 L55.79 13.41 L56.12 14.48 L56.46 15.50 L56.86 16.47 L57.33 17.38 L57.88 18.24 L58.52 19.06 L59.23 19.87 L60.00 20.69 L60.78 21.53 L61.53 22.41 L62.21 23.34 L62.79 24.32 L63.23 25.36 L63.51 26.44 L63.62 27.56 L63.56 28.68 L63.36 29.81 L63.03 30.92 L62.62 32.00 L62.18 33.05 L61.74 34.08 L61.35 35.08 L61.03 36.08 L60.80 37.08 L60.67 38.09 L60.63 39.14 L60.66 40.22 L60.72 41.33 L60.78 42.47 L60.79 43.63 L60.71 44.78 L60.52 45.91 L60.19 46.99 L59.71 48.00 L59.08 48.92 L58.31 49.75 L57.43 50.48 L56.47 51.11 L55.46 51.68 L54.44 52.21 L53.44 52.71 L52.50 53.23 L51.61 53.78 L50.80 54.40 L50.05 55.10 L49.34 55.87 L48.67 56.72 L48.00 57.61 L47.31 58.52 L46.58 59.41 L45.78 60.25 L44.91 60.99 L43.96 61.61 L42.94 62.07 L41.87 62.37 L40.75 62.51 L39.60 62.50 L38.46 62.37 L37.32 62.16 L36.20 61.90 L35.12 61.65 L34.06 61.44 L33.02 61.29 L32.00 61.24 L30.98 61.29 L29.94 61.44 L28.88 61.65 L27.80 61.90 L26.68 62.16 L25.54 62.37 L24.40 62.50 L23.25 62.51 L22.13 62.37 L21.06 62.07 L20.04 61.61 L19.09 60.99 L18.22 60.25 L17.42 59.41 L16.69 58.52 L16.00 57.61 L15.33 56.72 L14.66 55.87 L13.95 55.10 L13.20 54.40 L12.39 53.78 L11.50 53.23 L10.56 52.71 L9.56 52.21 L8.54 51.68 L7.53 51.11 L6.57 50.48 L5.69 49.75 L4.92 48.92 L4.29 48.00 L3.81 46.99 L3.48 45.91 L3.29 44.78 L3.21 43.63 L3.22 42.47 L3.28 41.33 L3.34 40.22 L3.37 39.14 L3.33 38.09 L3.20 37.08 L2.97 36.08 L2.65 35.08 L2.26 34.08 L1.82 33.05 L1.38 32.00 L0.97 30.92 L0.64 29.81 L0.44 28.68 L0.38 27.56 L0.49 26.44 L0.77 25.36 L1.21 24.32 L1.79 23.34 L2.47 22.41 L3.22 21.53 L4.00 20.69 L4.77 19.87 L5.48 19.06 L6.12 18.24 L6.67 17.38 L7.14 16.47 L7.54 15.50 L7.88 14.48 L8.21 13.41 L8.54 12.32 L8.93 11.22 L9.39 10.17 L9.95 9.17 L10.63 8.27 L11.43 7.49 L12.34 6.84 L13.35 6.32 L14.42 5.94 L15.55 5.67 L16.69 5.48 L17.82 5.34 L18.93 5.21 L20.00 5.04 L21.02 4.82 L22.00 4.52 L22.94 4.12 L23.87 3.64 L24.79 3.07 L25.72 2.46 L26.68 1.84 L27.68 1.25 L28.71 0.74 L29.79 0.34 L30.89 0.09Z" fill="#0058BA"/><g transform="translate(32 32) scale(0.86) translate(-32 -33)"><g fill="none" stroke="#FFFFFF" stroke-width="5.2" stroke-linecap="round"><path d="M13.6 24.6A26 26 0 0 1 50.4 24.6"/><path d="M19.6 30.6A17.5 17.5 0 0 1 44.4 30.6"/><path d="M25.6 36.6A9 9 0 0 1 38.4 36.6"/></g><circle cx="32" cy="45" r="6.4" fill="#D8E2FF"/><circle cx="32" cy="43.9" r="2.2" fill="#0058BA"/><path d="M30.7 44.4h2.6l.7 4h-4z" fill="#0058BA"/></g></svg>`; // trùng với public/favicon.svg (icon Expressive)

function donut(byCat, total, c, colorOf) {
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const arcs = byCat.map((x) => {
    const len = (x.value / total) * C;
    const el = `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${colorOf(x.name).hex}" stroke-width="34" stroke-dasharray="${Math.max(len - 2, 0.5)} ${C - Math.max(len - 2, 0.5)}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)"/>`;
    acc += len;
    return el;
  }).join('');
  return `<svg width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" fill="none" stroke="${c.surfaceContainerHigh}" stroke-width="34"/>${arcs}
    <text x="100" y="104" text-anchor="middle" font-size="34" font-weight="500" fill="${c.onSurface}">${total}</text>
    <text x="100" y="124" text-anchor="middle" font-size="13" fill="${c.onSurfaceVariant}">wifi</text></svg>`;
}

/** Dựng khối HTML của báo cáo. Mỗi phần tử có `data-block` là một khối không bị cắt đôi khi chia trang PDF. */
function buildSheet({ s, total, categoriesCount }, c, t, lang, colorOf) {
  const card = `background:${c.surfaceContainerLow};border-radius:24px;padding:24px;margin-top:20px;`;
  const h2 = `font-size:18px;font-weight:500;margin:0;color:${c.onSurface};`;
  const note = `font-size:12px;color:${c.onSurfaceVariant};margin:4px 0 18px;`;
  const tile = (bg, fg, value, label) => `<div style="flex:1;background:${bg};color:${fg};border-radius:24px;padding:18px 20px;"><div style="font-size:26px;line-height:32px;font-weight:700;white-space:nowrap;">${esc(value)}</div><div style="font-size:13px;margin-top:6px;opacity:.8;">${esc(label)}</div></div>`;
  const legend = s.byCat.map((x) => `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:14px;">
      <span style="width:12px;height:12px;border-radius:50%;background:${colorOf(x.name).hex};flex:none;"></span>
      <span style="flex:1;color:${c.onSurface};">${esc(x.name)}</span><b>${x.value}</b>
      <span style="width:44px;text-align:right;color:${c.onSurfaceVariant};">${Math.round((x.value / total) * 100)}%</span></div>`).join('');

  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:-10000px;top:0;width:${W}px;box-sizing:border-box;background:${c.surface};padding:40px;font-family:var(--font);color:${c.onSurface};`;
  el.innerHTML = `
    <div data-block style="display:flex;align-items:center;gap:16px;">
      ${LOGO}
      <div style="flex:1;"><div style="font-size:26px;line-height:30px;">${esc(t('app.name'))}</div><div style="font-size:14px;color:${c.onSurfaceVariant};">${esc(t('report.title'))}</div></div>
      <div style="font-size:13px;color:${c.onSurfaceVariant};text-align:right;">${esc(t('report.generated', { date: new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'long' }) }))}</div>
    </div>
    <div data-block style="display:flex;gap:14px;margin-top:28px;">
      ${tile(c.primaryContainer, c.onPrimaryContainer, total, t('stats.total'))}
      ${tile(c.secondaryContainer, c.onSecondaryContainer, categoriesCount, t('stats.categories'))}
      ${tile(c.tertiaryContainer, c.onTertiaryContainer, t('stats.chars', { n: s.avg }), t('stats.avgLen'))}
      ${tile(c.surfaceContainerHighest, c.onSurface, s.withNote, t('stats.withNote'))}
    </div>
    <div data-block style="${card}"><h2 style="${h2}">${esc(t('stats.ratioTitle'))}</h2><p style="${note}">${esc(t('stats.ratioNote'))}</p>
      <div style="display:flex;align-items:center;gap:32px;"><div style="flex:none;">${donut(s.byCat, total, c, colorOf)}</div><div style="flex:1;">${legend}</div></div></div>
    <div data-block style="margin-top:28px;text-align:center;font-size:12px;color:${c.onSurfaceVariant};">${esc(t('report.footer'))}</div>`;
  document.body.appendChild(el);
  return el;
}

/** Cắt chiều cao canvas thành các trang, không cắt ngang một khối nội dung */
function paginate(blocks, total, pageH) {
  const pages = [];
  let start = 0, prevBottom = 0;
  for (const b of blocks) {
    if (b.bottom - start > pageH && prevBottom > start) { pages.push([start, prevBottom]); start = b.top; }
    while (b.bottom - start > pageH) { pages.push([start, start + pageH]); start += pageH; } // khối quá cao → buộc phải cắt
    prevBottom = b.bottom;
  }
  pages.push([start, total]);
  return pages;
}

/**
 * Xuất báo cáo thống kê.
 * @param {object} p { format: 'pdf'|'png', s, total, categoriesCount, colors (bảng màu sáng), t, lang, colorOf }
 */
export async function exportReport({ format, s, total, categoriesCount, colors, t, lang, colorOf }) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), format === 'pdf' ? import('jspdf') : Promise.resolve({})]);
  await document.fonts?.ready;
  const node = buildSheet({ s, total, categoriesCount }, colors, t, lang, colorOf);
  try {
    const scale = 2;
    const canvas = await html2canvas(node, { scale, backgroundColor: colors.surface, useCORS: true, logging: false });
    const base = `wifi-vault-report-${stamp()}`;
    if (format === 'png') {
      await new Promise((resolve, reject) => canvas.toBlob((b) => { if (!b) return reject(new Error('png')); download(b, `${base}.png`); resolve(); }, 'image/png'));
      return;
    }
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 8;
    const pw = pdf.internal.pageSize.getWidth() - margin * 2;
    const ph = pdf.internal.pageSize.getHeight() - margin * 2;
    const pxPerMm = W / pw; // 1mm trên giấy = bao nhiêu px của khối báo cáo
    const top = node.getBoundingClientRect().top;
    const blocks = [...node.querySelectorAll('[data-block]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - top - (el === node.firstElementChild ? 0 : 20), bottom: r.bottom - top };
    });
    blocks[0].top = 0;
    const pages = paginate(blocks, node.offsetHeight, ph * pxPerMm);
    pages.forEach(([y0, y1], i) => {
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = Math.max(1, Math.round((y1 - y0) * scale));
      const ctx = slice.getContext('2d');
      ctx.fillStyle = colors.surface;
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, Math.round(y0 * scale), canvas.width, slice.height, 0, 0, canvas.width, slice.height);
      if (i) pdf.addPage();
      pdf.setFillColor(colors.surface);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, pw, (y1 - y0) / pxPerMm);
    });
    pdf.save(`${base}.pdf`);
  } finally {
    node.remove();
  }
}
