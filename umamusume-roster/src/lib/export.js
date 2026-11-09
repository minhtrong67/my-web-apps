import { iconUrl, wikiUrl } from '../data/characters';

export const toRows = (list, favSet) =>
  list.map((c) => ({
    no: c.no, id: c.id, name: c.name, group: c.group, namePrefix: c.prefix,
    japaneseName: c.d?.jp ?? null, voiceActor: c.d?.cv ?? null, birthdayMMDD: c.d?.birthday ?? null,
    heightCm: c.d?.height ?? null, bustWaistHip: c.d?.sizes ?? null, shoeSize: c.d?.shoe ?? null,
    division: c.d?.school ?? null, dorm: c.d?.dorm ?? null,
    favorite: favSet.has(c.id), iconUrl: iconUrl(c, 400), wikiUrl: wikiUrl(c)
  }));

const esc = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCSV = (rows) => {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\r\n');
};

export function buildFile(format, rows) {
  if (format === 'csv') return { content: '\uFEFF' + toCSV(rows), mime: 'text/csv;charset=utf-8', ext: 'csv' };
  return {
    content: JSON.stringify({ app: 'Umamusume Roster', exportedAt: new Date().toISOString(), count: rows.length, sources: ['umamusu.wiki', 'dbltap.com', 'gametora.com'], characters: rows }, null, 2),
    mime: 'application/json;charset=utf-8', ext: 'json'
  };
}

export function previewText(format, rows) {
  const r = rows.slice(0, 2);
  if (!r.length) return '';
  const text = format === 'csv' ? toCSV(r) : JSON.stringify(r, null, 2);
  return text.length > 700 ? text.slice(0, 700) + '\n…' : text;
}

export function download(filename, mime, content) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
