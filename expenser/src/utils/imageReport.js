import { drawPie } from './pieChart';
import { formatMoney } from './format';

// Period report as a PNG, drawn straight onto a <canvas>.
//
// This replaces the old html2canvas approach: Tailwind colour roles compile to
// `color-mix(in oklab, ...)`, which browsers resolve to `oklab(...)` - a colour
// function html2canvas cannot parse ("unsupported color function oklab"). Drawing
// directly never touches the page's computed styles, so it works with any theme,
// and it is faster and lighter than cloning the DOM.

const APP_NAME = 'Expenser';
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

const W = 640; // CSS px (rendered at 2x)
const PAD = 28;
const CONTENT_W = W - PAD * 2;
const ROW_H = 28;
const PIE = 190;

const font = (size, weight = 400) => `${weight} ${size}px ${FONT}`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Shortens text with an ellipsis so it fits `maxW` at the context's current font.
function fit(ctx, text, maxW) {
  const str = String(text ?? '');
  if (ctx.measureText(str).width <= maxW) return str;
  let lo = 0;
  let hi = str.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(`${str.slice(0, mid)}…`).width <= maxW) lo = mid;
    else hi = mid - 1;
  }
  return `${str.slice(0, lo)}…`;
}

function legendRows(slices) {
  return slices.slice(0, 10);
}

function pieBlockHeight(slices) {
  const rows = legendRows(slices).length;
  return 22 + 10 + Math.max(PIE, rows * ROW_H);
}

function drawPieBlock(ctx, y, heading, slices, showAmount) {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0A0A0A';
  ctx.font = font(15, 700);
  ctx.fillText(fit(ctx, heading, CONTENT_W), PAD, y + 11);

  const top = y + 22 + 10;
  drawPie(ctx, slices, { x: PAD, y: top, size: PIE, donut: true, holeColor: '#FFFFFF' });

  const rows = legendRows(slices);
  const listX = PAD + PIE + 20;
  const listR = W - PAD;
  const listTop = top + (Math.max(PIE, rows.length * ROW_H) - rows.length * ROW_H) / 2;

  rows.forEach((s, i) => {
    const cy = listTop + i * ROW_H + ROW_H / 2;
    ctx.fillStyle = s.color;
    roundRect(ctx, listX, cy - 5, 10, 10, 3);
    ctx.fill();

    // Percent (bold, right edge)
    ctx.textAlign = 'right';
    ctx.font = font(13, 700);
    ctx.fillStyle = '#0A0A0A';
    const pctText = `${Math.round(s.pct)}%`;
    ctx.fillText(pctText, listR, cy);
    let rightEdge = listR - Math.max(40, ctx.measureText(pctText).width) - 8;

    // Amount (optional)
    if (showAmount) {
      ctx.font = font(13);
      ctx.fillStyle = '#525252';
      const money = formatMoney(s.value);
      ctx.fillText(money, rightEdge, cy);
      rightEdge -= ctx.measureText(money).width + 8;
    }

    // Name fills what is left
    ctx.textAlign = 'left';
    ctx.font = font(13);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillText(fit(ctx, s.name, Math.max(40, rightEdge - (listX + 18))), listX + 18, cy);
  });
  return y + pieBlockHeight(slices);
}

function drawStat(ctx, x, y, w, h, label, value, bg, fg) {
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.8;
  ctx.font = font(12);
  ctx.fillText(fit(ctx, label, w - 32), x + 16, y + 20);
  ctx.globalAlpha = 1;
  // Shrink long amounts instead of cutting them off.
  let size = 17;
  ctx.font = font(size, 700);
  while (size > 11 && ctx.measureText(value).width > w - 32) {
    size -= 1;
    ctx.font = font(size, 700);
  }
  ctx.fillText(value, x + 16, y + 44);
}

/** Draws the whole report and returns the canvas. `createCanvas(w, h)` is injectable for tests. */
export function renderReportCanvas(r, createCanvas = defaultCreateCanvas, scale = 2) {
  const { title, subtitle, income, expense, count, expenseSlices, compareSlices, t } = r;

  const HEADER_H = 98;
  const STAT_H = 64;
  let height = PAD + HEADER_H + 14 + STAT_H + 10 + 16;
  if (expenseSlices.length) height += 22 + pieBlockHeight(expenseSlices);
  if (compareSlices.length) height += 22 + pieBlockHeight(compareSlices);
  height += 22 + 14 + PAD;

  const canvas = createCanvas(W * scale, height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, height);

  // Header card
  let y = PAD;
  ctx.fillStyle = '#70FF77';
  roundRect(ctx, PAD, y, CONTENT_W, HEADER_H, 28);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#005313';
  ctx.globalAlpha = 0.85;
  ctx.font = font(13, 700);
  ctx.fillText(APP_NAME, PAD + 22, y + 24);
  ctx.font = font(12);
  ctx.fillText(fit(ctx, subtitle, CONTENT_W - 44), PAD + 22, y + 80);
  ctx.globalAlpha = 1;
  ctx.font = font(22, 700);
  ctx.fillText(fit(ctx, title, CONTENT_W - 44), PAD + 22, y + 51);
  y += HEADER_H + 14;

  // Stat cards
  const gap = 10;
  const sw = (CONTENT_W - gap * 2) / 3;
  drawStat(ctx, PAD, y, sw, STAT_H, t('export.totalIncome'), formatMoney(income), '#C3ECD0', '#2A4E3A');
  drawStat(ctx, PAD + sw + gap, y, sw, STAT_H, t('export.totalExpense'), formatMoney(expense), '#FFDAD6', '#93000A');
  drawStat(ctx, PAD + (sw + gap) * 2, y, sw, STAT_H, t('export.difference'), formatMoney(income - expense), '#F5F5F5', '#0A0A0A');
  y += STAT_H + 10;

  // Count line: "label: <bold n>"
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = font(12);
  ctx.fillStyle = '#525252';
  const label = `${t('export.totalCount')}: `;
  ctx.fillText(label, PAD, y + 8);
  const lw = ctx.measureText(label).width;
  ctx.font = font(12, 700);
  ctx.fillText(String(count), PAD + lw, y + 8);
  y += 16;

  if (expenseSlices.length) {
    y += 22;
    y = drawPieBlock(ctx, y, t('export.pieExpense'), expenseSlices, false);
  }
  if (compareSlices.length) {
    y += 22;
    y = drawPieBlock(ctx, y, t('stats.compare'), compareSlices, true);
  }

  // Footer
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = font(11);
  ctx.fillStyle = '#737373';
  ctx.fillText(APP_NAME, W - PAD, y + 22 + 7);

  return canvas;
}

function defaultCreateCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

/** PNG blob of the report (browser). */
export async function buildImageReport(r) {
  const canvas = renderReportCanvas(r);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not encode the report image');
  return blob;
}
