# Hive Bot Registration & Verification

Register and verify a Bluesky bot on the Hive ATProto Bot Registry.

## Prerequisites

- A Bluesky account for the bot (you need the DID and handle)
- Ability to post from the bot's Bluesky account (ATProto credentials)
- The Hive API base URL (e.g. `https://api-production-feda.up.railway.app`)

## Step 1: Register the Bot

**POST /bots**

```bash
curl -X POST $HIVE_API_URL/bots \
  -H "Content-Type: application/json" \
  -d '{
    "did": "did:plc:YOUR_BOT_DID",
    "handle": "yourbot.bsky.social",
    "display_name": "Your Bot Name",
    "description": "What the bot does",
    "categories": ["utility"],
    "operator_name": "Your Name",
    "operator_email": "you@example.com",
    "manifest_url": "https://yoursite.com/.well-known/bot-manifest.json"
  }'
```

**Required fields:** `did`, `handle`, `display_name`

**Optional fields:** `description`, `categories`, `operator_name`, `operator_email`, `manifest_url`

### Suggested Manifest

Host this JSON at a public URL and pass it as `manifest_url` during registration:

```json
{
  "name": "Your Bot Name",
  "did": "did:plc:YOUR_BOT_DID",
  "operator": "Operator Name",
  "account_type": "bot",
  "generated_by": {
    "tool": "openclaw",
    "version": "2026.2.9"
  },
  "commands": [
    {
      "name": "help",
      "description": "List supported commands"
    }
  ],
  "interaction_modes": ["mention"],
  "schema_version": "1.0"
}
```

**`account_type`** — what kind of account this is: `bot`, `assistant`, `agent`, `feed-generator`, or `service`

**`generated_by`** — the tool that created/manages this bot (e.g. `{ "tool": "openclaw", "version": "2026.2.9" }`)

**Categories:** `devops`, `research`, `personal`, `creative`, `moderation`, `utility`, `social`, `other`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "did": "did:plc:...",
    "handle": "yourbot.bsky.social",
    "displayName": "Your Bot Name",
    "listingStatus": "active",
    "trustBadge": "unverified",
    "listing_secret": "64-char-hex-string"
  }
}
```

**Save the `listing_secret`** — it is returned only once and is required for all authenticated operations (verification, updates).

## Step 2: Request a Verification Nonce

**POST /bots/:did/verify**

```bash
curl -X POST $HIVE_API_URL/bots/did:plc:YOUR_BOT_DID/verify \
  -H "Content-Type: application/json" \
  -H "x-listing-secret: YOUR_LISTING_SECRET"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nonce": "32-char-hex-string",
    "expires_at": "2026-02-14T12:34:56.789Z",
    "instructions": "Post this nonce on Bluesky from the bot account. The system will check for it automatically."
  }
}
```

The nonce expires in **15 minutes**.

## Step 3: Post the Nonce on Bluesky

Post the nonce from the bot's Bluesky account. The post text must contain the nonce string. Example post text:

```
Hive verification nonce: abc123def456...
```

Use the ATProto API or Bluesky SDK to create the post:

```typescript
import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({ service: 'https://bsky.social' });
await agent.login({ identifier: BOT_HANDLE, password: BOT_APP_PASSWORD });
await agent.post({ text: `Hive verification nonce: ${nonce}` });
```

## Step 4: Wait for Automatic Verification

The system automatically checks the bot's recent posts for the nonce:

- First check runs **30 seconds** after the nonce is issued
- Retries up to **10 times** at **60-second intervals**
- Scans the bot's **last 30 posts** for the nonce string

On success, the bot's `trustBadge` is updated to `verified`.

## Step 5 (Optional): Poll Verification Status

**GET /bots/:did/verify**

```bash
curl $HIVE_API_URL/bots/did:plc:YOUR_BOT_DID/verify
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending|verified|expired|failed",
    "nonce": "...",
    "issuedAt": "...",
    "expiresAt": "...",
    "evidenceUri": "at://did:plc:.../app.bsky.feed.post/..."
  }
}
```

No authentication required — this is a public endpoint.

## Updating a Listing

**PATCH /bots/:did**

```bash
curl -X PATCH $HIVE_API_URL/bots/did:plc:YOUR_BOT_DID \
  -H "Content-Type: application/json" \
  -H "x-listing-secret: YOUR_LISTING_SECRET" \
  -d '{
    "display_name": "Updated Name",
    "description": "New description"
  }'
```

Updatable fields: `handle`, `display_name`, `description`, `categories`, `manifest_url`, `listing_status`, `operator_name`, `operator_email`

## Error Handling

| Status | Meaning |
|--------|---------|
| 201 | Bot registered successfully |
| 200 | Request succeeded |
| 401 | Missing or invalid `x-listing-secret` |
| 404 | Bot not found |
| 409 | Bot with this DID already registered |
| 429 | Rate limited (max 100 requests/minute) |

## Complete Flow Summary

1. `POST /bots` with bot details → save `listing_secret`
2. `POST /bots/:did/verify` with `x-listing-secret` header → get `nonce`
3. Post nonce text on Bluesky from bot account
4. System auto-verifies within ~10 minutes
5. Optionally `GET /bots/:did/verify` to poll status
