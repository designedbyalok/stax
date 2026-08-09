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

Uses `bun install` + `bun run build` (`vercel.json`). **Do not** add
`prisma migrate deploy` to the Vercel Build Command — Supabase pooler URLs
reject migrations and will fail the build.

### Database env vars (runtime)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase **pooler** URL (app + Prisma Client at runtime) |

Migrations are **not** run during Vercel builds. Apply them manually when needed:

```bash
# Uses DIRECT_URL from .env (direct connection, not pooler)
bun run db:migrate:deploy
```

For local/CI migrations, set `DIRECT_URL` to the Supabase **direct** host:

`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

Not the pooler host (`*.pooler.supabase.com`).
