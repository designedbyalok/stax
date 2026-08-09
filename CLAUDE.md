# Stax — Claude project notes

Stax is a job application tracker. Marketing site at `/` (editorial,
painted-sunrise palette, Instrument Serif + DM Sans). Authenticated app
at `/board`, `/list`, `/reminders`, `/settings` (Linear-style minimal,
Geist + shadcn primitives).

## Commit conventions

- **Do not add `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
  (or any other Co-Authored-By trailer) to commit messages.** Plain commit
  messages only.
- Keep the subject line under 70 characters, imperative mood.
- If a body is needed, separate it with a blank line and wrap at ~72.

## Stack at a glance

- Next.js 16 (App Router) · React 19 · TypeScript strict
- Bun for package management and scripts
- Tailwind 3 · shadcn/ui on `@base-ui/react` (note: uses `render` prop,
  not `asChild`)
- Prisma 5 + Postgres (Supabase pooler URLs)
- Auth.js v5 (JWT strategy, credentials + Google)
- React Query · Zustand · @dnd-kit
- Inngest cron · Resend email · PostHog · Sentry

## Working in this repo

- The landing page is scoped under `.landing-page` so its CSS variables
  (`--bg`, `--ink`, `--accent`, etc.) do not bleed into app routes. Keep
  it that way — app pages use the Linear shadcn token set in
  `globals.css`.
- App UI: prefer shadcn primitives (`Input`, `Button`, `Label`,
  `Textarea`, `Select*`) over hand-rolled `<input>`/`<button>`.
- Secrets live in `.env.local` (gitignored). `.env` holds only the
  Prisma database URLs because Prisma CLI doesn't read `.env.local`.
- Never commit anything matching `.env*`.
- **Vercel:** use `DATABASE_URL` (pooler) + `DIRECT_URL` (direct) for builds.
  Clear any custom Build Command in the Vercel dashboard — `vercel.json` runs
  `bun run vercel-build`, which migrates via `DIRECT_URL` when set.
