import { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { eq, desc } from 'drizzle-orm';
import { NONCE_TTL_MS } from '@hive/shared';
import { db } from '../db/index.js';
import { bots, verificationChallenges } from '../db/schema.js';
import { authenticateBot } from '../lib/auth.js';
import { verificationCheckQueue } from '../lib/queue.js';

export default async function (fastify: FastifyInstance) {
  // POST /bots/:did/verify — Issue nonce challenge
  fastify.post<{
    Params: { did: string };
  }>('/bots/:did/verify', async (request, reply) => {
    const listingSecret = request.headers['x-listing-secret'] as string;
    if (!listingSecret) {
      reply.code(401);
      return { success: false, error: 'Missing x-listing-secret header' };
    }

    const { did } = request.params;

    const bot = await authenticateBot(did, listingSecret, db);
    if (!bot) {
      reply.code(401);
      return { success: false, error: 'Invalid listing secret' };
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + NONCE_TTL_MS);

    const [challenge] = await db
      .insert(verificationChallenges)
      .values({
        botId: bot.id,
        nonce,
        expiresAt,
      })
      .returning();

    await verificationCheckQueue.add(
      'check',
      { challengeId: challenge.id, botId: bot.id, did },
      { delay: 30_000 },
    );

    return {
      success: true,
      data: {
        nonce,
        expires_at: expiresAt.toISOString(),
        instructions:
          'Post this nonce on Bluesky from the bot account. The system will check for it automatically.',
      },
    };
  });

  // GET /bots/:did/verify — Check verification status
  fastify.get<{
    Params: { did: string };
  }>('/bots/:did/verify', async (request, reply) => {
    const { did } = request.params;

    const botRows = await db
      .select()
      .from(bots)
      .where(eq(bots.did, did))
      .limit(1);

    if (botRows.length === 0) {
      reply.code(404);
      return { success: false, error: 'Bot not found' };
    }

    const bot = botRows[0];

    const challenges = await db
      .select()
      .from(verificationChallenges)
      .where(eq(verificationChallenges.botId, bot.id))
      .orderBy(desc(verificationChallenges.issuedAt))
      .limit(1);

    if (challenges.length === 0) {
      return { success: true, data: null };
    }

    return { success: true, data: challenges[0] };
  });
}
