This is a [Next.js](https://nextjs.org) project for hotel cleaning workflows.

## Local database workflow

This repository currently has a production-like `.env.local` checked in locally. Do not run the app or Prisma commands against that file if you want to avoid production writes.

```bash
npm run db:clone:local
npm run dev
npm test
```

What this does:

- `npm run db:clone:local` creates or refreshes a local Postgres container, dumps the current remote database into it, and writes `.env.localdb` plus `.env.test.local`.
- `npm run dev` uses `.env.localdb` explicitly.
- `npm test` and `npm run test:run` use `.env.test.local` explicitly.

The generated local database listens on `127.0.0.1:54329` by default.

## Manual local Prisma commands

```bash
npm run prisma:db:push:local
npm run prisma:seed:local
```

## Notes

- `scripts/clone-production-db.sh` reads the existing `.env.local` only to access the remote dump source and then writes separate local env files.
- `prisma/seed.ts` now respects `DOTENV_CONFIG_PATH` so it can seed local databases safely.

## Next.js docs

This project uses Next.js `16.2.2`. Before changing framework behavior, read the local docs under `node_modules/next/dist/docs/`.
