# Hive — Technical Design Document (directory/trust MVP)

_Last updated: 2026-02-13_

## System Overview
Hive is a lightweight web application plus background workers that provide:
1. **Registry API** — Fastify-based REST/GraphQL service that handles bot registration, nonce verification, manifest ingestion triggers, and public listing/search queries.
2. **Manifest Fetcher** — Worker that pulls each bot’s declared `manifest.json`, validates it, normalizes commands/capabilities, and stores a canonical snapshot.
3. **Verification Worker** — Polls pending challenges, fetches Bluesky posts/profile data via ATProto, and marks listings as verified once the nonce is observed.
4. **Search/Index Builder** — Maintains Postgres + MeiliSearch/Typesense indices for listings, commands, and tags (optional for MVP but planned).
5. **Web Client** — Next.js app (app router) that consumes public APIs to render the registry, categories, and individual bot pages.

No agent hosting, DM relays, or feed fanout components are required for Phase 1.

## Technology Choices
- **Runtime:** Node 20 + TypeScript across API and workers.
- **API Framework:** Fastify with `@fastify/type-provider-typebox` for typed schemas; GraphQL Yoga (optional) for future complex queries.
- **Background Jobs:** BullMQ (Redis) or simple cron workers for manifest refresh + verification checks.
- **Database:** PostgreSQL 16 for listings, operators, manifests, verification challenges, job telemetry pointers.
- **Cache/Queue:** Redis 7 for rate limits, job queues, and storing transient nonce challenges.
- **Search:** Typesense or MeiliSearch container (can be deferred) for fuzzy/semantic queries; fallback to Postgres full-text.
- **Web Client:** Next.js 15 with Tailwind/shadcn; server components fetch via public GraphQL/REST endpoints.
- **ATProto Integration:** Use `@atproto/api` to read DID docs, fetch posts, and validate nonce proofs; no need to run our own PDS.

## Data Model (simplified)
- `operators`: id, name, contact, verification_status.
- `bots`: id, did, handle, display_name, description, operator_id, categories, listing_status, trust_badge, created_at, updated_at.
- `capabilities`: bot_id, key (`responds_to_mentions`, `long_running_jobs`, etc.), metadata JSON.
- `manifests`: bot_id (PK), raw_json, schema_version, validated_at, errors[].
- `commands`: id, bot_id, name, description, args_schema JSON, example_mention, response_contract.
- `verification_challenges`: bot_id, nonce, issued_at, expires_at, status, evidence_uri.
- `reputation_metrics`: bot_id, responsiveness_ms, manifest_completeness_pct, report_count, last_seen_at.
- `job_reports` (future): bot_id, job_id, status, summary, source_uri.

## Key Workflows
### Registration & Verification
1. Operator creates a listing via API (provides DID/handle + contact info).
2. API issues a nonce challenge (`@bot please post <nonce>`).
3. Verification worker polls the listing’s Bluesky feed/profile via ATProto; once nonce is detected before expiry, listing is marked “verified” and trust badge assigned.
4. Operator can re-trigger verification if handle changes.

### Manifest Ingestion
1. Operator sets `manifest_url` in listing.
2. Manifest fetcher queues retrieval (immediate + scheduled refresh every N hours).
3. Worker fetches JSON, validates against schema (ajv), normalizes commands/capabilities, stores snapshot + diff.
4. API surfaces validation errors on the listing until resolved.

### Search & Browse
- API exposes `/public/bots` (filters: category, capability, trust tier) and `/public/search?q=` endpoints.
- Optional search service maintains inverted index for titles/descriptions/commands for low-latency queries.

### Job History (future-friendly)
- Bots optionally post job events (`Job started`, `Job progress`, `Job complete`) with `job_id`. Hive ingests via webhook or ATProto feed ingestion service; Phase 1 will just provide the schema and UI placeholders.

## Modules
### `server/api`
- Auth (operator session tokens + optional GitHub/Bluesky OAuth in future).
- Endpoints: register bot, update listing, request verification, trigger manifest refresh, public listing read/search.
- Rate limiting via Redis per IP/operator.
- GraphQL resolver for aggregated views (bot + manifest + reputation).

### `server/workers`
- `manifest-fetcher.ts`: consumes jobs from Redis queue, fetches manifests concurrently with per-domain throttling.
- `verification-checker.ts`: checks pending challenges, hits ATProto endpoints, writes verification status + evidence URI.
- `reputation-updater.ts`: (optional) ingests metrics (response times, reports) from auxiliary sources.

### `app/web`
- Pages: home (search + featured categories), bot detail, operators dashboard (after login), docs for manifest schema/interaction contract.
- Shares UI tokens + markdown partials for command grammar guidelines.

## Security & Safety Considerations
- Nonce challenges expire quickly to prevent replay; once verified, store evidence hash.
- Operators must authenticate (email magic link or GitHub OAuth) before editing listings.
- Webhook endpoints (future) require HMAC signatures.
- Rate limit public search/read endpoints to prevent scraping abuse.
- Manifest validator enforces maximum manifest size and rejects remote code references.

## Deployment / Docker
`docker-compose.yml` (dev) will include:
```
services:
  api:
    build: ./server/api
    env_file: .env
    depends_on: [postgres, redis]
    ports: ["3000:3000"]
  workers:
    build: ./server/workers
    command: ["pnpm","start:workers"]
    depends_on: [postgres, redis]
  web:
    build: ./app/web
    depends_on: [api]
    ports: ["3001:3000"]
  postgres:
    image: postgres:16
    environment: [...]
  redis:
    image: redis:7
  search:
    image: getmeili/meilisearch:latest # optional for MVP
```
CI (GitHub Actions) runs lint/tests, builds Docker images, and publishes to GHCR. Deployment targets (Fly.io, Render, or k8s) just need Postgres + Redis; no PDS or DM infra required.

## Testing Strategy
- **Unit tests:** API handlers, manifest schema validation, verification challenge lifecycle.
- **Integration tests:** Docker-compose harness that spins API + Postgres + mocked ATProto endpoints to validate registration flow end-to-end.
- **Contract tests:** Ensure manifests adhering to schema render correctly in the UI (Playwright snapshots).
- **Security tests:** Attempt replayed nonce, malformed manifests, rate-limit bypass to harden verification endpoints.

## Roadmap Hooks
- Plug-in ATProto labeler once MVP is stable (service publishes labels like `bot`, `spam-risk`).
- Add optional webhooks for bots to push job progress rather than relying solely on Bluesky scraping.
- Introduce reputation scoring weights once enough telemetry exists.

This TDD realigns Hive with the directory/trust mandate from Dennis’s Feb 13 proposal. Future edits should continue to resist scope creep into hosting or DM relays until the registry primitives ship.
