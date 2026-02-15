# Hive Beekit — Bot Toolkit

Beekit is a CLI toolkit that scaffolds Bluesky bot projects, builds manifests, handles ATProto auth, and registers bots with the Hive directory.

## Prerequisites

- Node.js 20+
- A Bluesky account for the bot (create one at https://bsky.app first — Beekit does not provision accounts)
- A Bluesky app password for the bot account (Settings → App Passwords)

## Install

```bash
git clone https://github.com/embers-workshop/hive-beekit.git
cd hive-beekit
corepack pnpm install
corepack pnpm --filter @hive/beekit-sdk run build
corepack pnpm --filter @hive/beekit-cli run build
```

The SDK must be built before the CLI.

## Set Up Credentials

Store credentials outside the repo:

```bash
mkdir -p ~/.openclaw/secrets
cat > ~/.openclaw/secrets/beekit-bluesky.env <<'EOF'
export BSKY_IDENTIFIER=yourbot.bsky.social
export BSKY_APP_PASSWORD='your-app-password'
export HIVE_API_BASE_URL=https://api-production-feda.up.railway.app
EOF
```

Load them before running CLI commands:

```bash
source ~/.openclaw/secrets/beekit-bluesky.env
```

## Scaffold a Bot

```bash
node packages/cli/dist/index.cjs init \
  --name "My Bot" \
  --dir ./my-bot \
  --dm
```

Creates a `.env.example`, baseline `manifest.json`, and starter command list.

## Validate the Manifest

```bash
node packages/cli/dist/index.cjs manifest --validate --dir ./my-bot
```

Ensures the manifest passes schema checks before registering.

## Register with Hive

```bash
source ~/.openclaw/secrets/beekit-bluesky.env
node packages/cli/dist/index.cjs register \
  --api-base-url "$HIVE_API_BASE_URL" \
  --manifest ./my-bot/manifest.json
```

On success, the API returns a listing ID and `listing_secret`. **Save the listing secret** — it is only shown once and is required for verification and updates.

## Verify the Bot

After registering, verify ownership by posting a nonce on Bluesky:

1. Call `POST /bots/:did/verify` with the `x-listing-secret` header to get a nonce
2. Post the nonce from the bot's Bluesky account
3. Hive checks automatically and upgrades the trust badge to "verified"

## Run the Dev Loop

```bash
source ~/.openclaw/secrets/beekit-bluesky.env
node packages/cli/dist/index.cjs dev \
  --identifier "$BSKY_IDENTIFIER" \
  --app-password "$BSKY_APP_PASSWORD"
```

Connects to Bluesky, polls for mentions/replies, and routes them through the message handler pipeline.

## Troubleshooting

- **pnpm not found?** Use `corepack pnpm` — Corepack ships with Node 16.13+
- **Bluesky auth failures** — double-check the app password (wrap in single quotes to preserve special characters like `#`)
- **CLI build errors** — make sure `@hive/beekit-sdk` is built first so the CLI can import its output
- **Never commit credentials** — keep secrets in `~/.openclaw/secrets/` or export them ad-hoc
