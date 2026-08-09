# Stax

Job application tracker built with Next.js.

## Getting started

Uses [Bun](https://bun.sh) for installs and scripts.

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run lint` | ESLint |
| `bun run db:seed` | Seed benchmark data |
| `bun run doctor` | React Doctor scan |

## Deploy on Vercel

Vercel uses `bun.lock` and `vercel.json` (`bun install` + `bun run vercel-build`).

**Important:** In the Vercel project → Settings → Build & Development, clear any
custom Build Command (e.g. `bunx prisma migrate deploy && next build`). The
repo’s `vercel.json` must own the build command.

### Database env vars

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase **pooler** URL (runtime queries) |
| `DIRECT_URL` | Supabase **direct** URL (migrations during build) |

`prisma migrate deploy` cannot run against the transaction pooler. The Vercel
build script runs migrations only when `DIRECT_URL` is set (using that URL).
Set `SKIP_DB_MIGRATE=1` to skip migrations on deploy and run them manually.

Direct URL format (Supabase):  
`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
