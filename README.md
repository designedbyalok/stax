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

Vercel detects `bun.lock` and runs `bun install` (also set in `vercel.json`).
