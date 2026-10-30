// Sinh bảng màu mặc định Material 3 Expressive (2026) từ màu hạt xanh blue.
//   → src/theme/default-scheme.json (token hex, dùng cho biểu đồ/báo cáo/PWA)
//   → src/theme/default-theme.css   (CSS variables dạng "R G B" cho Tailwind)
// Chạy: node scripts/build-theme.mjs   (màu nhấn: Vibrant spec 2025; bề mặt: trung tính, xem src/theme/scheme.js)
import { writeFileSync } from 'node:fs';
import { build } from 'esbuild';

// Gói thư viện bằng esbuild vì bản 0.4.0 dùng import không đuôi .js, Node thuần không nạp được
const out = await build({
  stdin: { contents: "export * from '@material/material-color-utilities';", resolveDir: process.cwd(), loader: 'js' },
  bundle: true, format: 'esm', platform: 'node', write: false,
});
const code = out.outputFiles[0].text;
const lib = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const { buildScheme, TOKENS } = await import('../src/theme/scheme.js');

export const SEED = '#1A73E8';
const light = buildScheme(lib, SEED, false), dark = buildScheme(lib, SEED, true);
const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const triplet = (h) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`; };
const vars = (s) => TOKENS.map((k) => `--md-${kebab(k)}:${triplet(s[k])}`).join(';');

writeFileSync(new URL('../src/theme/default-scheme.json', import.meta.url), JSON.stringify({ seed: SEED, light, dark }, null, 2) + '\n');
writeFileSync(new URL('../src/theme/default-theme.css', import.meta.url),
  `/* Token màu mặc định Material 3 Expressive (2026) — SINH TỰ ĐỘNG bằng scripts/build-theme.mjs. Đừng sửa tay. */\n:root{${vars(light)}}\n:root.dark{${vars(dark)}}\n`);
console.log('Seed', SEED, '| light primary', light.primary, 'container', light.primaryContainer, '| dark primary', dark.primary, '| surface', light.surface, dark.surface);
