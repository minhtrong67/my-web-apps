<div align="center">

# ⚓ Azur Lane Roster

**A fast, installable shipgirl database for _Azur Lane_ — browse, filter, inspect and export 600+ ships.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Features

- **Roster browser** — card **grid** and **list** views, incremental loading for smooth scrolling.
- **Search & filters** — search by name (EN/CN/JP/KR), class or ID; filter by **rarity**, **faction**, **ship type**; multiple sort orders.
- **Detail dialog** — click any card for full art, names, class, build time, artist, voice actor and stats (Lv.1 / Lv.100 / Lv.120) with comparison bars.
- **One-click copy** — copy a ship's name straight from the card (never overlaps the artwork).
- **Export** — download the filtered list (or everything) as **CSV** (Excel-friendly UTF-8) or **JSON**.
- **Settings**
  - Theme mode: Light / Dark / System
  - 19 theme colors (Red → Blue Grey)
  - Font size: Small / Medium / Large
  - Language: English / Tiếng Việt
  - Font: System (default) / Google Sans Flex / Roboto Flex / Roboto / Arial / Inter / Be Vietnam Pro — via a custom dropdown
- **Azur Lane–inspired UI** — hex grid backdrop, rarity-coloured cards, angular accents, shine & hover effects.
- **UX details** — custom tooltips, scrollbar, dropdowns (max height + scroll, keyboard support), toasts (info / success / warning / error, used sparingly), smooth *scroll-to-top*, reduced-motion support.
- **PWA** — installable, offline shell, cached artwork and fonts.

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

Ship thumbnails and artwork are loaded on demand from the AzurAPI repository and cached by the service worker.

## 🗂️ Project structure

```
├── public/               # favicon, PWA icons
├── scripts/build-data.mjs
├── src/
│   ├── components/       # UI primitives, ShipCard, Detail, Settings
│   ├── data/ships.json   # generated dataset
│   ├── lib/              # theme, i18n, data helpers, export
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
