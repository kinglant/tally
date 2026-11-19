# Tally: income & expense tracker

A clean, mobile-friendly web app for tracking income and expenses, built with **Next.js 16, React 19, TypeScript, Tailwind CSS v4 and Supabase**.

**Live demo: https://tally-nine-khaki.vercel.app** — it opens instantly with six months of sample data, with no sign-up needed.

## Features

- **Transactions:** add, edit and delete income and expenses with amount, date, category and note
- **Dashboard:** current balance, period totals with trend vs the same days last month, monthly income-vs-expenses chart, spending by category
- **Custom categories:** separate income and expense categories with colors; deleting one keeps its transactions as "Uncategorized"
- **Search & filters:** by note, category, type, preset date ranges or a custom range
- **CSV export:** filtered list or full history, opens directly in Excel and Google Sheets
- **Accounts:** email and password sign-in via Supabase Auth, with Postgres Row Level Security so each user only ever sees their own data
- **Demo mode:** a full-featured demo account stored in `localStorage`
- **Responsive:** sidebar on desktop, bottom navigation with a quick-add button on phones
- **Dark mode:** follows the system theme and remembers your choice
- **Currency display:** USD, EUR, GBP, UZS, VND, INR

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, lucide-react icons |
| Charts | Recharts |
| Backend | Supabase (Postgres + Auth), Row Level Security |
| Language | TypeScript (strict) |

## Architecture

```
src/
  app/                 routes: / (landing), /login, /app/* (dashboard, transactions, categories, settings)
  components/          AppShell, modals, charts, list rows
  components/views/    one client view per page
  lib/
    types.ts           domain types + DataStore interface
    store/supabase.ts  Supabase implementation of DataStore
    store/local.ts     localStorage implementation (demo)
    auth.tsx           auth context (Supabase session or demo session)
    data.tsx           data context: loads, caches and mutates user data
    stats.ts           totals, ranges, monthly series, category breakdown
    csv.ts             CSV export
supabase/schema.sql    tables, indexes and RLS policies
```

The UI talks only to the `DataStore` interface, so the same screens work against Supabase or the in-browser demo store.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000, works immediately in demo mode
```

### Enable real accounts (optional)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**.
4. Restart `npm run dev`. The sign-in page now shows email sign-up and sign-in.

New accounts get a default set of categories on first sign-in.

## Deploy

Deploy to Vercel. Add the two `NEXT_PUBLIC_SUPABASE_*` variables to enable accounts, or leave them out to ship a demo-only build.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
