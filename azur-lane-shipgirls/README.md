<div align="center">

# ⚓ Azur Lane Shipgirls

**A fast, installable shipgirl database for _Azur Lane_ — browse, filter, inspect and export 600+ ships.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Features

**Browse & find**
- Card **grid** / **list** views (comfortable or compact density) on a **virtualised** list — only the rows near the viewport are mounted, so all ~600 ships scroll smoothly.
- Accent-insensitive search with fuzzy matching and highlighted matches — by name (EN/CN/JP/KR), class, faction or ID.
- Filters for **rarity**, **faction**, **ship type** and **collection** (favorites / owned / not owned), five sort orders, removable filter chips and a mobile bottom-sheet.
- **Shareable URLs** — filters, search and the open ship are stored in the link; the browser Back button closes the dialog.

**Ship details**
- Two-image gallery (**Portrait** / **Full art**) you switch yourself via tabs, arrow button or swipe — nothing changes automatically. Artwork is auto-cropped (transparent margins removed) and opens in a zoom viewer; `←`/`→` still move between ships.
- Tabs: **Overview** (names with per-language copy, info, hexagon radar chart, stat bars for Lv.1 / 100 / 120), **Skills**, **Skins** (chibi gallery + full art), **Obtain** (sources, construction pools, equipment slots).

**Collection tools**
- ❤️ Favorites and ✅ *owned* markers with a progress pill, stored on-device.
- **Select mode** — pick ships to copy names, bulk-mark, **compare 2–3 ships** (radar overlay + best-value highlights) or export just the selection.
- **Export** the filtered list, all ships or the selection as **CSV** (Excel-friendly UTF-8) or **JSON**.

**Settings**
- Theme mode (Light / Dark / System), 19 theme colors (contrast-checked), font size, card density.
- Interface language: English, Tiếng Việt, 日本語, 简体中文, 한국어 (every UI string translated; hull types, rarities and most faction names localised) — plus a separate *ship name language*.
- Font: System (default) / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro via a custom dropdown.
- Toggle crossover (collab) ships, **backup / restore** settings and collection, install-as-app button.

**Polish**
- Azur Lane–inspired look: hex-grid backdrop, rarity-coloured cards, animated rainbow borders for Ultra Rare / Decisive, faction-tinted background, blur-up image loading.
- Custom tooltips, scrollbar, dropdowns (scrollable, keyboard-friendly), focus-trapped dialogs, arrow-key navigation in segmented controls, toasts used sparingly, reduced-motion support.
- **PWA** — installable, offline shell, cached artwork/fonts, in-app “new version” prompt, offline/online notices.

## ⌨️ Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Ctrl/⌘ + K` or `/` | Focus search |
| `Esc` | Clear search, then leave the field |
| `G` | Toggle grid / list |
| `S` | Toggle select mode |
| `E` | Open export |
| `,` | Open settings |
| `T` | Cycle theme mode |
| `←` / `→` | Previous / next ship in the detail dialog |
| `?` | Show the shortcut list |

## 🧰 Tech stack

| Area | Choice |
| --- | --- |
| UI | React 18 |
| Styling | Tailwind CSS 3 (CSS-variable theming) |
| Build | Vite 6 |
| PWA | vite-plugin-pwa (Workbox) |
| Icons | lucide-react |

## 🚀 Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

Requires **Node.js 18+**.

### Refreshing the ship data

The roster is bundled as a slim JSON file (`src/data/ships.json`) generated from the [AzurAPI](https://github.com/AzurAPI/azurapi-js-setup) dataset:

```bash
npm run data                              # download the latest dataset and rebuild
node scripts/build-data.mjs ./ships.json  # or use a local copy
```

Heavy details (skills, skins, obtain info) are written to a second file, `src/data/extra.json`, which is only downloaded when a detail dialog opens. Images are loaded on demand from the AzurAPI repository (with a jsDelivr fallback) and cached by the service worker. A GitHub Action (`.github/workflows/update-data.yml`) refreshes the dataset weekly.

## 🗂️ Project structure

```
├── public/               # favicon, PWA icons
├── scripts/build-data.mjs
├── src/
│   ├── components/       # UI primitives, ShipCard, Detail, Compare, Radar, Settings, Shortcuts
│   ├── data/             # generated ships.json + extra.json
│   ├── lib/              # theme, i18n, data, search, collection, pwa, export
│   ├── App.jsx
│   └── index.css         # theme tokens, animations, component styles
├── tailwind.config.js
└── vite.config.js        # PWA manifest + caching rules
```

## 🎨 Customisation

- **Colors** — add or edit entries in `src/lib/theme.js` (`COLORS`).
- **Fonts** — add a family to `FONTS` and load it in `index.html`.
- **Languages** — extend the dictionaries in `src/lib/i18n.jsx`.
- **Deploying** — the build uses relative paths (`base: './'`), so `dist/` works on GitHub Pages, Netlify, Vercel or any static host.

## 📚 Data sources

- [AzurAPI](https://github.com/AzurAPI/azurapi-js-setup) — ship dataset and images (successor of the `azurlane-api` projects)
- [Azur Lane Wiki](https://azurlane.koumakan.jp/) — reference and ship pages
- [Fandom Full Ship List](https://blhx.fandom.com/wiki/Full_Ship_List) and [gacha.gg](https://www.gacha.gg/azur-lane/characters) — cross-reference

## ⚖️ Disclaimer

This is an unofficial fan project. *Azur Lane* and all related names, characters and artwork are the property of their respective owners (Shanghai Manjuu, Xiamen Yongshi, Yostar). This project is not affiliated with or endorsed by them.

## 👤 Author

Created by **minhtrong67**, with the support of AI — **Claude** (Anthropic).

Released under the [MIT License](LICENSE).
