<div align="center">

<img src="public/icons/icon-192.png" alt="Moody" width="88" height="88" />

# Moody

**A modern minimalist mood journal**

Check in every day, see your emotional trends and export reports. Light & dark themes, English / Tiếng Việt, installable as a PWA.

**English** · [Tiếng Việt](README.vi.md)

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10-ffca28?logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-ready-0d9488)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

<br />

<img src="screenshots/desktop-light-dashboard.png" alt="Moody — Today (light)" width="49%" />
<img src="screenshots/desktop-dark-stats.png" alt="Moody — Statistics (dark)" width="49%" />

<img src="screenshots/mobile-light-checkin.png" alt="Moody — Check-in (light)" width="24%" />
<img src="screenshots/mobile-dark-settings.png" alt="Moody — Settings, theme color (dark)" width="24%" />

</div>

---

## Table of contents

- [About](#about)
- [Screenshots](#screenshots)
- [Features](#features)
- [Design system](#design-system)
- [Landing page & navigation](#landing-page--navigation)
- [Theme-aware toasts](#theme-aware-toasts)
- [PWA](#pwa)
- [Getting started](#getting-started)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## About

Moody lets you log your mood in seconds: pick one of 5 mood levels, tag the activities of your day and add a note. Review it later as a list, a monthly calendar or statistics charts, or export it as a PDF/PNG report.

- **No account needed** — guest mode keeps data in `localStorage`; sign in with Google to sync through Firestore.
- **Mobile-first, desktop-ready** — bottom navigation on phones, a permanent sidebar and multi-column layouts on laptops.
- **Private by design** — your data is yours: export/import CSV, Excel or JSON at any time.

## Screenshots

| Desktop — Today (light) | Desktop — Statistics (dark) |
|---|---|
| ![Today](screenshots/desktop-light-dashboard.png) | ![Statistics](screenshots/desktop-dark-stats.png) |

| Mobile — Check-in (light) | Mobile — Settings · theme color (dark) |
|---|---|
| <img src="screenshots/mobile-light-checkin.png" width="240" /> | <img src="screenshots/mobile-dark-settings.png" width="240" /> |

## Features

| Area | Description |
|---|---|
| **Today** | Greeting, check-in status, 7-day strip, current streak, weekly average and recent check-ins |
| **Check-in** | Date & time, 1 of 5 moods, multiple activities and an auto-growing note; editable any time |
| **History** | List view (search, filters, sorting, swipe to edit/delete) and monthly calendar view |
| **Statistics** | By day / week / month / year: trend, mood distribution, most frequent activities |
| **Reports** | Export PDF or PNG with key metrics and pie charts |
| **Manage** | Custom activities (drag to reorder) and custom emoji / names for the 5 moods |
| **Landing page** | Responsive marketing page with scroll animations, light/dark/system theme, English/Vietnamese and full SEO / social-share meta |
| **Settings** | Light / dark / system theme, **theme color** (10 Material 3 Expressive palettes), font size, language, start page, PWA install, data export / import |

## Design system

Moody follows **Material 3 Expressive (2026)**: a teal colour scheme, large rounded shapes (28 px cards, pill buttons that morph to a 12 px corner when pressed), emphasized Google Sans Flex typography (rounded `ROND` axis for headlines), spring-based motion, tonal surfaces instead of borders, and a morphing loading indicator. Icons are thin-stroke ([Lucide](https://lucide.dev)).

**Single source of truth: [`src/styles/theme.css`](src/styles/theme.css)** — Material 3 colour roles (`--md-*`, light + `.dark`) generated from the default teal seed `#009688` (primary `#006a60` light / `#82d5c8` dark), plus the shape scale and spring easing tokens. Nothing else declares colors.

```
theme.css  ──►  index.css (--c-* roles + components)  ──►  tailwind.config.js  ──►  bg-surface · text-on-surface · bg-primary/10 …
(--md-* tokens)  maps roles, defines buttons/FAB/…          maps roles to classes
```

- **Theme color (Settings):** users pick one of 10 palettes (teal by default, then green, cyan, blue, indigo, violet, pink, red, orange, yellow). Palettes are pre-generated in [`src/lib/palettes.js`](src/lib/palettes.js) (TonalSpot scheme, light + dark) and applied at runtime by overriding the `--md-*` tokens; the browser `theme-color` meta follows the active surface colour.
- To add or change a colour: edit `SEEDS` in [`scripts/gen-theme.mjs`](scripts/gen-theme.mjs) and run `npm run gen:theme` — it rewrites `palettes.js` and the default blocks in `theme.css`.
- Shape scale: `--shape-xs 4 · sm 8 · md 12 · lg 16 · xl 28 · xl-inc 32 · xxl 48 · full`, exposed as `rounded-*` in Tailwind.
- Motion: `--spring-*-spatial` (slight overshoot, for position/size/shape) and `--spring-*-effects` (no overshoot, for colour/opacity); `prefers-reduced-motion` is respected.
- App icon, favicon and OG image are generated by [`scripts/build-icons.py`](scripts/build-icons.py) (12-lobe "cookie" shape + face, teal). `favicon.svg` follows the browser's light/dark mode.
- Chart colors read from CSS are resolved to hex via canvas (`readRole()` in `src/lib/theme.js`).

## Landing page & navigation

| State | Behaviour |
|---|---|
| First visit / signed out | Opens the landing page (`/#/welcome`). **Log in** → `/#/login`; **Get started** → guest mode. |
| Signed in or guest | Goes straight to the app on every later visit; the landing page is skipped. |
| Settings → Introduction | Opens the landing page again on demand. |
| Log out | Returns to the landing page. |

The share tags (Open Graph, Twitter Card, JSON-LD, canonical, hreflang, `robots.txt`, `sitemap.xml`) point at the production URL **https://moody-mood-tracker.vercel.app/**.

## Theme-aware toasts

Toasts are Material 3 snackbars (inverse surface, `success` / `info` / `error` icon variants) and follow the theme in both light and dark mode.

## Getting started

Requirements: **Node.js ≥ 18** and npm.

```bash
git clone https://github.com/minhtrong67/Moody-MoodTracker.git moody
cd moody
npm install
cp .env.example .env     # then fill in your Firebase config
npm run dev
```

Open `http://localhost:5173`. **It works without Firebase** — the app falls back to guest mode (local data).

### Firebase setup (optional)

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. **Authentication → Sign-in method** → enable **Google**.
3. **Firestore Database** → create a database.
4. **Project settings → Your apps** → create a Web app and copy the values into `.env`:

   | Variable | Meaning |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | Web API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | Project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
   | `VITE_FIREBASE_APP_ID` | App ID |
   | `VITE_SITE_URL` | Deployed URL, no trailing `/` (canonical / Open Graph) |

5. Restrict Firestore so each user can only access their own data:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

> ⚠️ `.env` is git-ignored. **Never commit real keys or secrets** to a public repository.

## Tech stack

| Area | Technology |
|---|---|
| UI | React 18, React Router 6 (`HashRouter`) |
| Build / PWA | Vite 5, `vite-plugin-pwa` (Workbox) |
| Styling | Tailwind CSS 3 + Material 3 theme tokens |
| Typography & icons | Google Sans Flex (`@fontsource-variable/google-sans-flex`, Vietnamese included), `lucide-react` |
| Backend | Firebase Authentication (Google) + Cloud Firestore |
| Charts | Recharts |
| Reports | `html2canvas-pro` + jsPDF (loaded on demand) |
| Import / export | `read-excel-file`, `write-excel-file`, `fflate` |
| i18n | Lightweight custom translator (`src/i18n`) |

## Project structure

```
├── index.html                  # SEO / Open Graph meta, theme bootstrap script, boot screen
├── vite.config.js              # Vite + PWA (manifest) + chunk splitting
├── tailwind.config.js          # Maps --c-* roles to Tailwind classes
├── public/
│   ├── sitemap.xml · robots.txt
│   ├── landing/                    # landing page screenshots (webp, light/dark)
│   └── icons/ · favicon · og-image.png
├── screenshots/                # the 4 images used in this README
└── src/
    ├── styles/theme.css        # ★ default (teal) color tokens, shape + motion tokens
    ├── lib/palettes.js         # generated — 10 selectable theme palettes
    ├── index.css               # derived roles, typography, buttons, fields, motion
    ├── pages/Landing.jsx · Login.jsx   # marketing page · sign-in
    ├── lib/                    # session · theme · moodConfig · dateUtils · statsUtils · reportGenerator · dataTransfer
    ├── components/             # AppShell · Sidebar · Dialog · TextField · Switch · Login …
    ├── pages/                  # Dashboard · CheckIn · History · Statistics · Settings · Manage*
    ├── context/ · hooks/       # Auth, MoodEntries, Activities, Moods, Toast
    └── i18n/                   # vi.js · en.js
```

**Data model** — `users/{uid}/entries/{id}`: `date` (`YYYY-MM-DD`), `time` (ISO), `mood` (`great|good|okay|sad|angry`), `score` (1–5), `activities[]`, `note`. Custom activities / moods live in `users/{uid}/meta/*`; guest mode uses `localStorage`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |

Adding text: add the key to **both** `src/i18n/en.js` and `src/i18n/vi.js`, then use `const {{ t }} = useI18n()`.

## Deployment

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, Firebase Hosting). `HashRouter` means no SPA rewrites are required. Set `VITE_SITE_URL` before building, and add your domain to Firebase **Authentication → Settings → Authorized domains** for Google sign-in.

## Browser support

Modern evergreen browsers. The theme relies on `color-mix()` and CSS `linear-gradient`/variables: Chrome / Edge 111+, Safari 16.2+, Firefox 113+.

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`.
2. Keep to the design system: use theme tokens (`bg-surface`, `text-on-surface-variant`, `text-brand`…), never hard-coded colors.
3. Make sure `npm run build` passes and add UI text to both languages.
4. Open a pull request describing what changed and why.

## License

Released under the [MIT License](LICENSE) © 2026 minhtrong67.
