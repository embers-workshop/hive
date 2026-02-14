import { Worker, Job } from 'bullmq';
import { MANIFEST_MAX_SIZE_BYTES, validateManifest } from '@hive/shared';
import { sql } from './db.js';

interface ManifestFetchJob {
  botId: string;
  manifestUrl: string;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

async function processManifestFetch(job: Job<ManifestFetchJob>): Promise<void> {
  const { botId, manifestUrl } = job.data;
  console.log(`[manifest-fetcher] Processing bot=${botId} url=${manifestUrl}`);

  let rawJson: unknown;

  // Fetch the manifest
  try {
    const response = await fetch(manifestUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      await upsertManifestError(botId, [`HTTP ${response.status}: ${response.statusText}`]);
      return;
    }

    // Check Content-Length header if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MANIFEST_MAX_SIZE_BYTES) {
      await upsertManifestError(botId, [
        `Manifest too large: ${contentLength} bytes exceeds ${MANIFEST_MAX_SIZE_BYTES} byte limit`,
      ]);
      return;
    }

    const body = await response.text();

    // Validate actual body size
    if (Buffer.byteLength(body, 'utf-8') > MANIFEST_MAX_SIZE_BYTES) {
      await upsertManifestError(botId, [
        `Manifest too large: exceeds ${MANIFEST_MAX_SIZE_BYTES} byte limit`,
      ]);
      return;
    }

    try {
      rawJson = JSON.parse(body);
    } catch {
      await upsertManifestError(botId, ['Invalid JSON in manifest response']);
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await upsertManifestError(botId, [`Network error fetching manifest: ${message}`]);
    return;
  }

  // Validate the manifest against the schema
  const result = validateManifest(rawJson);

  if (!result.success) {
    const errors = result.errors.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    console.log(`[manifest-fetcher] Validation failed for bot=${botId}:`, errors);
    await upsertManifestError(botId, errors);
    return;
  }

  const manifest = result.data;
  console.log(`[manifest-fetcher] Manifest valid for bot=${botId}, upserting...`);

  // Upsert the manifest row
  const dmEnabled = manifest.dm?.enabled ?? false;
  const dmRetention = manifest.dm?.retention ?? null;

  await sql`
    INSERT INTO manifests (bot_id, raw_json, schema_version, validated_at, errors, interaction_modes, dm_enabled, dm_retention, created_at, updated_at)
    VALUES (
      ${botId},
      ${JSON.stringify(rawJson)},
      ${manifest.schema_version},
      NOW(),
      '[]'::jsonb,
      ${JSON.stringify(manifest.interaction_modes)},
      ${dmEnabled},
      ${dmRetention},
      NOW(),
      NOW()
    )
    ON CONFLICT (bot_id) DO UPDATE SET
      raw_json = EXCLUDED.raw_json,
      schema_version = EXCLUDED.schema_version,
      validated_at = NOW(),
      errors = '[]'::jsonb,
      interaction_modes = EXCLUDED.interaction_modes,
      dm_enabled = EXCLUDED.dm_enabled,
      dm_retention = EXCLUDED.dm_retention,
      updated_at = NOW()
  `;

  // Replace commands: delete existing, insert new
  await sql`DELETE FROM commands WHERE bot_id = ${botId}`;

  if (manifest.commands.length > 0) {
    const commandRows = manifest.commands.map((cmd) => ({
      bot_id: botId,
      name: cmd.name,
      description: cmd.description || '',
      args_schema: cmd.args_schema ? JSON.stringify(cmd.args_schema) : null,
      example_mention: cmd.example_mention || null,
      response_contract: cmd.response_contract || null,
    }));

    for (const row of commandRows) {
      await sql`
        INSERT INTO commands (bot_id, name, description, args_schema, example_mention, response_contract)
        VALUES (
          ${row.bot_id},
          ${row.name},
          ${row.description},
          ${row.args_schema ? sql`${row.args_schema}::jsonb` : sql`NULL`},
          ${row.example_mention},
          ${row.response_contract}
        )
      `;
    }
  }

  // Activate bot if it was in draft status
  await sql`
    UPDATE bots
    SET listing_status = 'active', updated_at = NOW()
    WHERE id = ${botId} AND listing_status = 'draft'
  `;

  console.log(`[manifest-fetcher] Completed bot=${botId}`);
}

async function upsertManifestError(botId: string, errors: string[]): Promise<void> {
  console.log(`[manifest-fetcher] Recording errors for bot=${botId}:`, errors);

  await sql`
    INSERT INTO manifests (bot_id, raw_json, errors, created_at, updated_at)
    VALUES (
      ${botId},
      '{}'::jsonb,
      ${JSON.stringify(errors)},
      NOW(),
      NOW()
    )
    ON CONFLICT (bot_id) DO UPDATE SET
      errors = ${JSON.stringify(errors)}::jsonb,
      updated_at = NOW()
  `;
}

export const manifestFetchWorker = new Worker<ManifestFetchJob>(
  'manifest-fetch',
  processManifestFetch,
  {
    connection: { url: redisUrl },
    concurrency: 5,
  },
);

manifestFetchWorker.on('completed', (job) => {
  console.log(`[manifest-fetcher] Job ${job.id} completed`);
});

manifestFetchWorker.on('failed', (job, err) => {
  console.error(`[manifest-fetcher] Job ${job?.id} failed:`, err.message);
});

console.log('[manifest-fetcher] Worker started');
