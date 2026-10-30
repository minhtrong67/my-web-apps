<div align="center">

<img src="public/favicon.svg" alt="Streak Logger logo" width="112" height="112" />

# Streak Logger

**Keep the streak alive.** Track the time since a milestone, keep a daily streak journal and see your progress in clear charts.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Material 3 Expressive](https://img.shields.io/badge/Design-Material_3_Expressive-7C3AED)](https://m3.material.io)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](#progressive-web-app)

English · [Tiếng Việt](README.vi.md)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Design system](#design-system)
- [Customization](#customization)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Deployment](#deployment)
- [Data model](#data-model)
- [Importing data](#importing-data)
- [Project structure](#project-structure)
- [Progressive Web App](#progressive-web-app)
- [Scripts](#scripts)
- [Credits](#credits)

## Overview

Streak Logger is a privacy-first web app for people who build habits. Sign in with Google, set a milestone (for example "no sugar since…") and the app counts the elapsed time live. Alongside it you keep a streak journal, and the statistics page turns those entries into charts. Everything syncs in real time across your devices through Firebase, and every account can only ever read its own data.

## Features

| Area | What you get |
| --- | --- |
| **Time Streak** | Live elapsed time (years, months, days, hours, minutes) since a milestone, with one-tap copy buttons and a countdown for future milestones. |
| **Streak Journal** | Add, edit and view entries in full-screen sheets, delete with confirmation, a floating action button (FAB) to add. Search, sort and filter (time of day, date range), per-column search on desktop, swipe gestures on mobile (right to edit, left to delete) and bulk delete. |
| **Statistics** | Highlight cards and **two pie charts** (distribution over time and by time of day) with full labels and values on the chart, plus **percentage progress bars** right below each pie. Views by day, week, month or year. Export a **detailed PDF** report or a compact **PNG** (figures and the two pie charts only). |
| **Settings** | Display mode, theme color and font (collapsible sections), text size, language, **import and export of the journal** (CSV, JSON, Excel; export also Word, PDF, PNG), install prompt, reset to defaults, sign out and the author card. |
| **Safety** | Every edit and delete goes through a confirmation dialog. Input is trimmed and validated on the client and again by Firestore Rules. |
| **Offline friendly** | Installable PWA, offline banner and toasts when the connection drops or returns. |

## Design system

The interface follows **Material 3 Expressive**:

- **Color**: roles (`primary`, `secondary-container`, `surface-container-*`, `outline-variant`...) are generated at runtime from the chosen theme color with Material's dynamic color algorithm (*Vibrant* variant), in both light and dark. Success, warning and info roles are harmonized with the active theme.
- **Shape**: large corner radii (cards 24px, dialogs and sheets 28px), pill buttons that **morph** to a tighter corner while pressed, and a 12-lobe "cookie" logo.
- **Motion**: spring easing with a slight overshoot, emphasized easing for page and sheet transitions, ripple and state layers on every interactive element, staggered list entrances. `prefers-reduced-motion` is respected.
- **Components**: navigation drawer / rail, navigation bar with a pill indicator, connected button groups, tonal icon buttons, filled text fields, switches, snackbars (toasts), dialogs, full-screen sheets and bottom sheets.
- **Action buttons** in every dialog, confirm dialog and sheet carry a **label, an icon and a role color** so each action is recognizable at a glance: Cancel (neutral, `X`), Save (primary, `Check`), Update (primary, `Save`), Delete (error, `Trash2`), Sign out and Reset (warning).
- **Sheets vs. dialogs**: every add, edit and detail view is a full-screen sheet; dialogs are reserved for short confirmations. Updating or deleting always asks for confirmation first. Option lists on mobile use a bottom sheet.
- **Toasts** have four variants (`info`, `success`, `error`, `warning`), adapt to light and dark, pause on hover and show a countdown bar.
- **Scroll to top** button appears after scrolling down, animates with a custom requestAnimationFrame easing (independent of the OS reduced-motion setting and of CSS `scroll-behavior`), and lifts above the FAB when one is shown.
- **Custom dropdowns**: no native `<select>`. The listbox follows light/dark and the theme color, opens in a portal (never clipped by dialogs or accordions), flips upward when there is no room, is capped at 280px with a scrollbar and supports the keyboard.
- **Custom scrollbars**: slim, rounded and tinted by the active theme, with a standards-based fallback for Firefox.
- **Login screen**: a split layout with a branded hero (feature highlights, decorative cookie shapes) and a focused sign-in card; stacked on mobile.
- **Icons** come from [Lucide](https://lucide.dev). The default font is the **system font**.

## Customization

Open **Settings** to change, instantly and per device:

- **Display mode**: Light, Dark or System.
- **Theme color**: Violet (brand default) plus the 18 Material Design palette colors: red, pink, purple, deep purple, indigo, blue, light blue, cyan, teal, green, light green, lime, yellow, amber, orange, deep orange, brown and blue grey.
- **Text size**: Small, Medium or Large (scales the whole UI).
- **Font**: System (default), Google Sans Flex, Roboto Flex, Roboto, Arial, Inter or Be Vietnam Pro. Web fonts are bundled through [Fontsource](https://fontsource.org), loaded lazily only when selected and cached for offline use.
- **Language**: English or Tiếng Việt, including dates, validation messages, exported files and PDF reports.

Long sections (theme color, font) are collapsible accordions that show the current choice while collapsed. The author card (**minhtrong67**, with the support of **Claude**) appears only in Settings, as its last block.

## Tech stack

- **UI**: React 19, Vite, Tailwind CSS v4, Lucide icons
- **Color**: `@material/material-color-utilities`
- **Backend**: Firebase Authentication (Google) and Cloud Firestore
- **Charts and files**: Recharts, jsPDF + autotable, docx, SheetJS, PapaParse
- **PWA**: `vite-plugin-pwa` (Workbox)
- **Tooling**: oxlint, sharp (icon generation)

## Getting started

### 1. Create a Firebase project

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. **Authentication → Sign-in method**: enable **Google**.
3. **Firestore Database**: create a database (production mode).
4. **Project settings → Your apps**: add a Web app and copy its configuration.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Until these are set, the sign-in screen shows a configuration warning.

### 3. Publish the Firestore Rules

Paste `firestore.rules` into **Firestore Database → Rules** and publish, or use the CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

### 4. Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. For a production build:

```bash
npm run build
npm run preview
```

## Deployment

Deploy the `dist/` folder to Firebase Hosting, Vercel, Netlify or any static host (a `vercel.json` rewrite is included). The app is a single-page app, so every path must fall back to `index.html`. After deploying, add your domain under **Authentication → Settings → Authorized domains**, otherwise Google sign-in reports an unauthorized domain.

## Data model

```
users/{uid}/timeStreaks/current     the single time milestone
    title       string, 1 to 100 characters
    start_at    ISO 8601 string
    note        string up to 500 characters, or null

users/{uid}/streakPosts/{id}        streak journal entries
    post_date   string YYYY-MM-DD
    post_time   string HH:mm
    duration    string, 1 to 100 characters
    description string up to 2000 characters, or null
```

Each user's data lives under `users/{uid}`, so the rules only need to check `request.auth.uid == uid`.

## Importing data

CSV, Excel and JSON files need these columns (English and Vietnamese headers are both accepted, case and accents are ignored):

| Column | Aliases | Example |
| --- | --- | --- |
| Date | `post_date`, `Ngày` | `29/09/2026` or `2026-09-29` |
| Time | `post_time`, `Giờ` | `07:30` (empty becomes `00:00`) |
| Duration | `Thời lượng` | `45 minutes` |
| Description | `Mô tả` | optional |

Rows with a missing duration or an invalid date or time are skipped and reported in the result toast. Files exported by the app can be imported back as they are. Maximum size is 5 MB.

## Project structure

```
src/
  components/      layout, forms, export menu, swipe rows, brand mark...
    ui/            primitives: Button, Modal, Sheet, ConfirmDialog, Segmented, Toast helpers...
  context/         Auth, Theme (mode + color), Appearance (size + font), Lang, Toast
  hooks/           Firestore realtime hooks, overlays, media queries, scroll position, PWA install
  i18n/            vi.js, en.js and the shared translate() store
  lib/             Firebase initialization
  pages/           Login, TimeStreaks, StreakPosts, Statistics, Settings
  theme/           palette.js (Material color roles), fonts.js, brand.js (logo geometry), defaults.css
  utils/           validation, import, export, statistics, PDF report, ripple
scripts/           generate-icons.mjs (favicon, app icons, splash screens)
firestore.rules    Firestore security rules
```

## Progressive Web App

- **Icons and favicon** are generated from one logo definition (`src/theme/brand.js`) by `npm run icons`, so the favicon, app icon, splash screens and the logo in the header and sidebar are always identical.
- **Splash and status bar** match the app background: `#FEF7FF` in light and `#15121C` in dark. The theme color meta tag follows the active surface color, so the mobile status bar blends into the header.
- iOS splash images live in `public/splash`; Android reads `manifest.webmanifest` or `manifest-dark.webmanifest`; the boot frame in `index.html` also follows the saved theme.
- The OS reads splash images and manifest colors itself and cannot see the in-app theme choice. After updating the icons, uninstall and reinstall the app to see the change.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (with service worker) |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm run icons` | Regenerate favicon, app icons and splash screens |

## Credits

Designed and developed by **[minhtrong67](https://github.com/minhtrong67)**, with the support of AI: **Claude (Anthropic)**.
