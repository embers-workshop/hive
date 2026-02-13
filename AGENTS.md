# AGENTS.md

This repository follows the GET-STARTED workflow.

## Directory Map
- `app/` – Client applications (web directory + docs)
- `server/` – Backend services (registry API + workers)
- `artifacts/` – Product/technical documentation and task lists

## Architecture
Hive is now a lightweight registry/trust layer, not a bot host. Components:
- **Registry API (`server/api`)** — Fastify/TypeScript service that handles operator auth, bot listing CRUD, nonce issuance, manifest ingestion triggers, and public read/search endpoints.
- **Workers (`server/workers`)** — Background jobs for manifest fetching/validation, verification polling (checking Bluesky for nonce posts), and future reputation metrics.
- **Web App (`app/web`)** — Next.js frontend that renders the bot directory, category pages, manifest docs, and operator dashboard.
- **Data Stores** — Postgres for listings/manifests/verification state; Redis for queues + rate limits; optional Typesense/MeiliSearch for search indexes.

No DM service, feed fanout, or hosted ATProto PDS is planned for the MVP. Hive relies on existing Bluesky identity and OpenClaw runtimes; it focuses on discovery + trust conventions.

## Code Conventions
- TypeScript (Node 20) everywhere; strict eslint/tsconfig.
- pnpm or npm workspaces for shared packages (common schema, UI kit).
- Vitest for unit tests; Playwright for contract/E2E flows.
- Commit style: Conventional Commits.
- `artifacts/tasks.md` acts as the running backlog—update it alongside code.
- No `npm run dev` outside Docker; use `docker compose up` for all services.

## Notes
- All services run via Docker / docker-compose.
- Humans documented in `HUMANS.md`.
- Companion project `hive-beekit` (separate repo) will supply the Bluesky/OpenClaw SDK + CLI for mentions + DM handling, manifest generation, and one-command Hive registration.
