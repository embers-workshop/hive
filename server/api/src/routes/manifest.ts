import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bots } from '../db/schema.js';
import { authenticateBot } from '../lib/auth.js';
import { manifestFetchQueue } from '../lib/queue.js';

export default async function (fastify: FastifyInstance) {
  // POST /bots/:did/refresh-manifest — Trigger manifest re-fetch
  fastify.post<{
    Params: { did: string };
  }>('/bots/:did/refresh-manifest', async (request, reply) => {
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

    await manifestFetchQueue.add('fetch', {
      botId: bot.id,
      did: bot.did,
      manifestUrl: bot.manifestUrl,
    });

    return { success: true, data: { queued: true } };
  });
}
