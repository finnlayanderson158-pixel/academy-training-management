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

## How it works

The app has two role views, switchable from the top-right role selector (there is no real authentication yet — this is a client-only prototype):

- **Spreadsheet** (`/`) — the primary Excel-style Academy roster. Every recruit is a row with NAME, DISCORD USERNAME, HIRING DATE, HIRED BY, and training status columns (Macros, Taser, Ride Alongs, Driving Test, Shield, Passive, Aggressive). Supports search, filters, and sorting. The NAME column and header row stay visible while scrolling.
- **Admin Panel** (`/admin`, Academy Supervisor / Admin role only) — recruit management (add/edit/remove, complete missing info, correct training records), FTO management (add/remove/activate any number of FTOs), and a full training history log.

### FTO workflow

Any active FTO can click **Upload Training** from the spreadsheet page to log training for a recruit:

1. Search for the recruit by name.
2. If found, select the FTO (defaults to the FTO selected in the role switcher) and the training completed, then save — the spreadsheet updates immediately.
3. If the recruit isn't in the roster yet, a **Recruit Not Found** prompt offers to create a bare-bones record (Discord Username / Hiring Date / Hired By left as "Not Added") with the logged training already applied. The recruit is flagged with a "Missing Academy Information" indicator until a Supervisor fills in the rest from the Admin Panel.

FTOs cannot set Hired By, Hiring Date, or manage other FTOs/recruits directly — those are Admin-only actions.

Every training change (FTO upload or admin edit) is recorded in the Training History log with the previous value, new value, who made the change, and when.

## Project structure

```
src/
  types.ts                  Domain types and constants
  lib/storage.ts             localStorage persistence + seed data
  lib/recruitStatus.ts       Shared "is recruit fully trained" helper
  context/AppContext.tsx     Global state and all mutation/business logic
  components/                Navbar, modals, FTO manager, history panel
  pages/Spreadsheet.tsx      Main Excel-style roster
  pages/Admin.tsx            Academy Leadership admin panel
```

Data is persisted to `localStorage` under the `academy-training-state-v1` key. The `AppContext` module is structured so the storage layer can be swapped for a real API/database later without changing the UI.
