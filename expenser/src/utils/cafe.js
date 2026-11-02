// Helpers for the cafe mini-module.

/** Lower-case, strip Vietnamese diacritics - so "Cà phê", "CAFE" and "Coffee" all compare alike. */
export function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * A category counts as the "cafe" category when its name mentions cafe / cà phê / coffee
 * (any casing, with or without diacritics) - e.g. "Cafe", "Cà phê", "Coffee shop".
 */
export function isCafeCategory(category) {
  if (!category) return false;
  const n = normalizeText(category.name).replace(/[^a-z0-9]+/g, ' ');
  return n.includes('cafe') || n.includes('caphe') || n.includes('ca phe') || n.includes('coffee');
}

export const SESSIONS = ['morning', 'noon', 'afternoon', 'evening', 'night'];

/** Part of the day a drink was had: morning 05-11, noon 11-14, afternoon 14-18, evening 18-22, else night. */
export function getSession(date) {
  const h = new Date(date).getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 14) return 'noon';
  if (h >= 14 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

export const SESSION_COLORS = {
  morning: '#F59E0B',
  noon: '#F97316',
  afternoon: '#8B5CF6',
  evening: '#3B82F6',
  night: '#6366F1',
};

export const CHART_PALETTE = ['#B45309', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444', '#84CC16', '#64748B'];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Period (week Mon-Sun / month / year) that contains `anchor` -> { start, end } (end inclusive). */
export function getPeriod(range, anchor) {
  const a = new Date(anchor);
  if (range === 'week') {
    const dow = (a.getDay() + 6) % 7;
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate() - dow);
    return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999) };
  }
  if (range === 'year') {
    return { start: new Date(a.getFullYear(), 0, 1), end: new Date(a.getFullYear(), 11, 31, 23, 59, 59, 999) };
  }
  return { start: new Date(a.getFullYear(), a.getMonth(), 1), end: new Date(a.getFullYear(), a.getMonth() + 1, 0, 23, 59, 59, 999) };
}

/** Move the anchor one period back (-1) or forward (+1). */
export function shiftAnchor(range, anchor, dir) {
  const a = new Date(anchor);
  if (range === 'week') return new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7 * dir).getTime();
  if (range === 'year') return new Date(a.getFullYear() + dir, 0, 1).getTime();
  return new Date(a.getFullYear(), a.getMonth() + dir, 1).getTime();
}

export { startOfDay };
