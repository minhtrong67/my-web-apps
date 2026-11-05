# minhtrong67 · Web Apps

**[English](./README.en.md) · [Tiếng Việt](./README.md)**

<div align="center">

**A collection of small web applications built to solve real everyday needs.**

React · Vite · Tailwind CSS · Firebase · PWA · Material 3 Expressive

[![GitHub repository](https://img.shields.io/badge/GitHub-minhtrong67%2Fmy--web--apps-181717?logo=github)](https://github.com/minhtrong67/my-web-apps)
[![Apps](https://img.shields.io/badge/apps-8-7C3AED)](https://github.com/minhtrong67/my-web-apps)
[![Author](https://img.shields.io/badge/author-minhtrong67-0D9488)](https://github.com/minhtrong67)

</div>

## Overview

`my-web-apps` is a monorepo containing independent web applications by **minhtrong67**. Each subdirectory is a standalone project with its own `package.json`, build configuration and README, so apps can be developed or deployed independently.

The projects focus on practical everyday experiences: responsive interfaces, Vietnamese and English support, installable PWA capabilities and a Material 3 Expressive design system adapted to each product.

> This repository currently contains **8 web applications**. Some apps require Firebase Authentication and Cloud Firestore; check each app's setup instructions before running it.

## Application catalog

| Application | Description | Technology / notes |
| --- | --- | --- |
| [**BA List**](./ba-list) | Look up Blue Archive students with smart search, filters, detail pages and offline support. | React 19 · Vite · Tailwind CSS · PWA |
| [**Calendar Pro**](./calendar-pro) | Vietnamese solar/lunar calendar and almanac with Can Chi, lucky hours, holidays and countdowns. | React 18 · Vite · Tailwind CSS · Vitest |
| [**Expenser**](./expenser) | Personal expense tracking with multiple wallets, categories, charts, reminders and synced data. | React 19 · Vite · Firebase · Recharts · PWA |
| [**Moody**](./moody) | Mood journal with five-level check-ins, activities, calendar, trends and reports. | React 18 · Vite · Firebase · Recharts · PWA |
| [**Personal Keep**](./personal-keep) | Organize personal projects, Google accounts, websites, prompts and API keys. | React 18 · Vite · Firebase · PWA |
| [**Sayuri Vault**](./sayuri-vault) | Modular personal data vault with search, categories, import/export and browser-side password encryption. | React 19 · Vite · Firebase · Tailwind CSS |
| [**Streak Logger**](./streak-logger) | Track time from a personal milestone, keep a streak journal, view statistics and export reports. | React 19 · Vite · Firebase · Recharts · PWA |
| [**Wifi Vault**](./wifi-vault) | Store, search, categorize and back up Wi-Fi passwords. | React 18 · Vite · Firebase · Recharts · PWA |

Each app has its own README with more details about features, screenshots, data structures and deployment instructions.

## Shared technology

- **Frontend:** React and React DOM.
- **Build tool:** Vite.
- **Styling:** Tailwind CSS and Material 3 Expressive CSS variables.
- **Backend and authentication:** Firebase Authentication and Cloud Firestore for apps that need synced data.
- **PWA:** `vite-plugin-pwa`, service workers and web manifests for apps that support installation.
- **Charts and reports:** Recharts, jsPDF, SheetJS and app-specific export libraries.
- **Icons:** Lucide Icons and product-specific icon sets.

Dependency versions may differ between apps. Always run commands from the target app directory rather than from the repository root.

## Quick start

### Requirements

- Node.js 18 or newer.
- npm 9 or the npm version bundled with your Node.js installation.
- A Firebase project if the selected app contains an `.env.example` file.

### Run an application

For example, to run `wifi-vault`:

```bash
git clone https://github.com/minhtrong67/my-web-apps.git
cd my-web-apps/wifi-vault
npm install
npm run dev
```

Then open the development URL printed by Vite, usually `http://localhost:5173`.

Replace `wifi-vault` with the directory of the app you want to run:

```bash
cd ba-list
cd calendar-pro
cd expenser
cd moody
cd personal-keep
cd sayuri-vault
cd streak-logger
cd wifi-vault
```

Do not run all of these `cd` commands in the same terminal session. Choose one application directory for each task.

### Firebase configuration

Apps with an `.env.example` file must be configured before Google sign-in or synced data can work:

```bash
cp .env.example .env
```

Fill in the Firebase Web App variables using the template provided in `.env.example`. The usual setup is:

1. Create or select a project in the [Firebase Console](https://console.firebase.google.com).
2. Add a Web App and copy its configuration into `.env`.
3. Enable Google under **Authentication → Sign-in method** if the app uses Google sign-in.
4. Create a Cloud Firestore Database.
5. Apply the app's `firestore.rules` file when one is included.
6. When deploying, add the production domain to Firebase Authentication's **Authorized domains**.

Never commit `.env` files or any secret to Git. Firebase client configuration may be visible in the frontend, but data access must still be protected with Firestore Rules and authenticated user checks.

### Common commands

Run these commands from an individual application directory:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
```

Some projects also provide commands such as `lint`, `test`, `icons`, `theme` or i18n checks. Run `npm run` to see all scripts supported by the current app.

## Build and deployment

Each app is built independently:

```bash
cd <application-directory>
npm install
npm run build
```

The build output is placed in `dist/` and can be deployed to Firebase Hosting, Vercel, Netlify or another SPA-compatible static host. Apps using React Router require a rewrite from unknown routes to `index.html`.

When deploying an app that uses Firebase:

- Configure production environment variables on the hosting platform.
- Add the deployed domain to **Authorized domains**.
- Review Firestore Rules before exposing the application publicly.
- Do not reuse an app's sample Firestore Rules in another project without understanding its data model and access requirements.

## Repository structure

```text
my-web-apps/
├── ba-list/          # Blue Archive student lookup
├── calendar-pro/     # Vietnamese solar/lunar calendar
├── expenser/         # Personal expense tracker
├── moody/            # Mood journal
├── personal-keep/    # Projects, accounts, websites and prompts
├── sayuri-vault/     # Modular personal data vault
├── streak-logger/    # Streak and milestone journal
├── wifi-vault/       # Wi-Fi password manager
├── index.html        # Web app collection landing page
├── README.md         # Vietnamese documentation
└── README.en.md      # English documentation
```

Each app generally has its own `src/`, `public/`, `package.json`, Vite configuration and README. Do not share `node_modules` or `.env` files between applications.

## Development conventions

- Keep changes for an app inside that app's directory whenever possible.
- Update the app-level README when features, environment variables or build commands change.
- Keep Vietnamese and English copy consistent with the application's i18n system.
- Check responsive behavior on mobile and desktop before merging.
- Run `npm run build` and any available `lint` / `test` commands before opening a pull request.
- Never commit personal data, real API keys, credentials or exported data files.

## Contributing

To suggest a change or report a bug:

1. Fork the repository.
2. Create a branch for your change:
   ```bash
   git checkout -b feat/your-change
   ```
3. Limit edits to the relevant application.
4. Run the appropriate build and checks.
5. Open a pull request describing the goal, scope and verification steps.

## Author

Designed and developed by [**minhtrong67**](https://github.com/minhtrong67), with AI tools supporting parts of the research and development process.

- GitHub: [github.com/minhtrong67](https://github.com/minhtrong67)
- Repository: [minhtrong67/my-web-apps](https://github.com/minhtrong67/my-web-apps)

## License

Licenses may differ between applications. Check the `LICENSE` file or the **License** section in each app's README before using, copying or redistributing its source code.
