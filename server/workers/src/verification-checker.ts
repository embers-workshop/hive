import { Worker, Job, Queue } from 'bullmq';
import { BskyAgent } from '@atproto/api';
import { sql } from './db.js';

interface VerificationCheckJob {
  botId: string;
  challengeId: string;
  nonce: string;
  did: string;
  _attempt?: number;
}

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 60_000;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const verificationQueue = new Queue<VerificationCheckJob>('verification-check', {
  connection: { url: redisUrl },
});

async function processVerificationCheck(job: Job<VerificationCheckJob>): Promise<void> {
  const { botId, challengeId, nonce, did } = job.data;
  const attempt = job.data._attempt ?? 1;

  console.log(
    `[verification-checker] Processing challenge=${challengeId} bot=${botId} attempt=${attempt}`,
  );

  // Check if the challenge has expired
  const [challenge] = await sql`
    SELECT id, status, expires_at FROM verification_challenges
    WHERE id = ${challengeId}
  `;

  if (!challenge) {
    console.log(`[verification-checker] Challenge ${challengeId} not found, skipping`);
    return;
  }

  if (challenge.status !== 'pending') {
    console.log(
      `[verification-checker] Challenge ${challengeId} status is '${challenge.status}', skipping`,
    );
    return;
  }

  const expiresAt = new Date(challenge.expires_at as string);
  if (expiresAt < new Date()) {
    console.log(`[verification-checker] Challenge ${challengeId} has expired`);
    await sql`
      UPDATE verification_challenges
      SET status = 'expired'
      WHERE id = ${challengeId}
    `;
    return;
  }

  // Search the bot's recent posts for the nonce
  let foundPostUri: string | null = null;

  try {
    const agent = new BskyAgent({ service: 'https://public.api.bsky.app' });

    const response = await agent.getAuthorFeed({
      actor: did,
      limit: 30,
    });

    for (const item of response.data.feed) {
      const post = item.post;
      const record = post.record as { text?: string };
      if (record.text && record.text.includes(nonce)) {
        foundPostUri = post.uri;
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[verification-checker] ATProto API error for did=${did}: ${message}`,
    );

    // Re-queue if we haven't exhausted retries
    if (attempt < MAX_RETRIES) {
      console.log(
        `[verification-checker] Re-queuing challenge=${challengeId} (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await verificationQueue.add(
        'check',
        { ...job.data, _attempt: attempt + 1 },
        { delay: RETRY_DELAY_MS },
      );
    } else {
      console.error(
        `[verification-checker] Max retries reached for challenge=${challengeId}, marking failed`,
      );
      await sql`
        UPDATE verification_challenges
        SET status = 'failed'
        WHERE id = ${challengeId}
      `;
    }
    return;
  }

  if (foundPostUri) {
    console.log(
      `[verification-checker] Nonce found in post ${foundPostUri} for challenge=${challengeId}`,
    );

    // Mark challenge as verified
    await sql`
      UPDATE verification_challenges
      SET status = 'verified', evidence_uri = ${foundPostUri}
      WHERE id = ${challengeId}
    `;

    // Update bot trust badge
    await sql`
      UPDATE bots
      SET trust_badge = 'verified', updated_at = NOW()
      WHERE id = ${botId}
    `;

    console.log(`[verification-checker] Bot ${botId} verified`);
  } else {
    // Nonce not found yet — re-queue if retries remain
    if (attempt < MAX_RETRIES) {
      console.log(
        `[verification-checker] Nonce not found, re-queuing challenge=${challengeId} (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await verificationQueue.add(
        'check',
        { ...job.data, _attempt: attempt + 1 },
        { delay: RETRY_DELAY_MS },
      );
    } else {
      console.log(
        `[verification-checker] Max retries reached for challenge=${challengeId}, marking expired`,
      );
      await sql`
        UPDATE verification_challenges
        SET status = 'expired'
        WHERE id = ${challengeId}
      `;
    }
  }
}

export const verificationCheckWorker = new Worker<VerificationCheckJob>(
  'verification-check',
  processVerificationCheck,
  {
    connection: { url: redisUrl },
    concurrency: 3,
  },
);

verificationCheckWorker.on('completed', (job) => {
  console.log(`[verification-checker] Job ${job.id} completed`);
});

verificationCheckWorker.on('failed', (job, err) => {
  console.error(`[verification-checker] Job ${job?.id} failed:`, err.message);
});

console.log('[verification-checker] Worker started');
