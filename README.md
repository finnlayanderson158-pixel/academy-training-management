# Academy Training Management

An Excel-style Academy roster and FTO training tracker. Built with React, TypeScript, Vite, Tailwind CSS, and browser `localStorage` (no backend required).

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser. Build for production with:

```bash
npm run build
```

## Three separate pages

There's no login or role switcher — each page is its own standalone URL and doesn't link to the others:

- **`/` — Roster (read-only)**: the primary Excel-style Academy spreadsheet. Every recruit is a row with NAME, DISCORD USERNAME, HIRING DATE, HIRED BY, and training status columns (Macros, Taser, Ride Alongs, Driving Test, Shield, Passive, Aggressive). Supports search, filters, and sorting. The NAME column and header row stay visible while scrolling. No editing controls live here.
- **`/fto` — FTO Training Upload**: a big, minimal 3-step wizard (pick recruit → pick your name → pick the training) built to be usable with zero explanation. If the recruit isn't in the roster yet, a **Recruit Not Found** prompt offers to create a bare-bones record (Discord Username / Hiring Date / Hired By left as "Not Added") with the training already applied. FTOs cannot set Hired By or Hiring Date — those stay Supervisor-only.
- **`/admin` — Academy Leadership Admin**: the Supervisor panel — recruit intake (add new recruits), edit/remove recruits, complete missing info left by an FTO-created recruit, manage any number of FTOs, edit any training cell directly, and view the full training history.

Every training change (FTO upload or Supervisor edit) is recorded in the Training History log with the previous value, new value, who made the change, and when.

## Project structure

```
src/
  types.ts                  Domain types and constants
  lib/storage.ts             localStorage persistence + seed data
  lib/recruitStatus.ts       Shared "is recruit fully trained" helper
  context/AppContext.tsx     Global state and all mutation/business logic
  components/                PageHeader, modals, FTO manager, history panel
  pages/Spreadsheet.tsx      Read-only roster (/)
  pages/FtoUpload.tsx        FTO training upload wizard (/fto)
  pages/Admin.tsx            Academy Leadership admin panel (/admin)
```

Data is persisted to `localStorage` under the `academy-training-state-v1` key. The `AppContext` module is structured so the storage layer can be swapped for a real API/database later without changing the UI.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages.
