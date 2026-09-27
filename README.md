# FinanceFlow

Your money, in perspective. A personal finance dashboard for tracking everyday income, expenses and monthly budgets.

## Description

FinanceFlow is a browser-based React application with a quiet dark theme, an optional light theme and a responsive layout. It is a learning and portfolio project with fictional sample data. No account or bank connection is required.

## Features

- Dashboard with an all-time balance, selected-month income, expenses and net savings, plus five recent transactions.
- Add, edit and delete transactions in keyboard-accessible native dialogs.
- Combined search, category, type and month filters; stable date and amount sorting.
- Monthly category budgets with actual spending, remaining amounts and over-budget states.
- Spending breakdown and six-month income/expense charts, with accessible numeric summaries.
- Persistent preferences and local data; explicit recovery for damaged browser storage.
- USD/EUR display conversion using a validated daily reference rate, cached fallback and retry.
- Offline status, meaningful empty states and an application error boundary.

## Tech Stack

React 19, TypeScript, Vite, React Router, CSS Modules and Recharts. Tests use Vitest, React Testing Library, user-event and Playwright. ESLint and Prettier keep the project consistent. The lockfile records the exact installed versions.

Recharts provides responsive bar and donut charts without a custom chart engine. All chart inputs are derived from transactions. State belongs to `App`; there is no additional state management library. Recharts 3.10.1 declares React 19 compatibility in its peer dependencies.

## Getting Started

Use Node.js 22.12 or newer in the 22.x line, or Node.js 24+. Node 22 is the project default in `.nvmrc`.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

On Windows, double-click `start.cmd`. The launcher uses Node from PATH, or the portable Node installation in `%LOCALAPPDATA%\FinanceFlowTools` created in this workspace's development environment. It installs missing dependencies and opens the browser. The portable runtime is outside the repository; on another computer, install Node first.

## Scripts

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the local development server          |
| `npm run build`        | Typecheck and create `dist/`                |
| `npm run preview`      | Serve the production build locally          |
| `npm run typecheck`    | Check TypeScript                            |
| `npm run lint`         | Check ESLint rules                          |
| `npm run format`       | Format source and documentation             |
| `npm run format:check` | Check formatting                            |
| `npm test`             | Run unit and component tests once           |
| `npm run test:watch`   | Watch unit and component tests              |
| `npm run test:e2e`     | Run browser workflows and responsive checks |

Install the browser once before running Playwright:

```sh
npx playwright install chromium
npm run test:e2e
```

Network responses are mocked in automated tests. Browser screenshots use fictional demo transactions and a mocked exchange rate.

## Screenshots

![Desktop dashboard](docs/screenshots/dashboard-desktop.png)

<img src="docs/screenshots/dashboard-mobile.png" alt="Mobile dashboard with compact bottom navigation" width="300" />

## Data and Limitations

- The first visit creates 20 fictional transactions across the current and two previous months. An intentionally saved empty array stays empty.
- Transactions and budgets use positive integer USD cents. Forms accept a dot or comma and up to two decimal places. Future and invalid calendar dates are rejected. Each dataset's combined positive amounts must fit within JavaScript's safe integer range; both forms and storage validation enforce this limit.
- USD/EUR changes presentation only. USD inputs and saved values remain unchanged. Without a valid current or cached rate, the app displays USD explicitly.
- [Frankfurter](https://frankfurter.dev/) supplies the daily reference rate through `/v2/rate/USD/EUR`. The app requests only this public currency pair; it does not upload transactions.
- Three versioned `localStorage` keys store transactions, budgets and settings. A fourth stores the last successful exchange rate. Corrupt data is preserved until you confirm a reset in Settings. Write failures leave the app usable in memory and show a warning.
- Browser data is tied to the origin, browser and profile. Clearing site data removes it. There is no cloud backup, import/export, encryption, account system, server or bank synchronization. Multiple tabs are not synchronized; use one tab when editing.
- Local editing continues if the connection drops while the app is open. This is not an installable PWA and does not promise an offline first page load.
- Fonts load from Google Fonts with system fallbacks. Exchange rates need network access, and the connectivity indicator does not guarantee API availability.

## Learning Topics

Start with `src/App.tsx` for shared state and routes; then read `src/utils/finance.ts` for pure calculations. `TransactionForm.tsx` demonstrates controlled fields and validation. `Dialog.tsx` handles native focus behavior. Storage and network code live in `src/services` and `src/hooks`.

The [Russian interview guide](docs/interview-guide.md) includes 40 questions tied to real code, five exercises and a short demo script. See [PLAN.md](PLAN.md) for the implementation map and [deployment instructions](docs/deployment.md) for static hosting.

## Future Improvements

Consider JSON import/export for backups, synchronization between browser tabs, custom categories, recurring transactions and a service worker. None of these features are currently implemented.

Suggested GitHub description: **Personal finance dashboard built with React and TypeScript. Transaction tracking, monthly budgets, spending charts and local-first data.**
