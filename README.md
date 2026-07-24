# Personal Interface

A personal todo app built with Next.js (App Router) and Tailwind CSS. Data is stored in the browser via `localStorage` — there's no backend database.

## Features

- Daily, list, tag, and month views for todos
- Drag-and-drop reordering, priorities, due dates, and repeating todos
- Jobs panel: scrape a LinkedIn job posting URL and save it to a Google Sheet, with a duplicate-submission check (warns if you've already submitted to the same company in the last 7 days)

## Getting started

Requires Node 20 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The Jobs panel's "Save to Sheets" feature requires:

- `GOOGLE_SERVICE_ACCOUNT_JSON` — service account credentials JSON for a Google account with edit access to the target spreadsheet
- `GOOGLE_SHEETS_ID` — the spreadsheet ID, expected to have a `Jobs` sheet with columns `A:F` (source, company, role, date, location, link)

Without these set, scraping still works but saving will fail.
