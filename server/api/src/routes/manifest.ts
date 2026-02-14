import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bots } from '../db/schema.js';
import { authenticateOperator } from '../lib/auth.js';
import { manifestFetchQueue } from '../lib/queue.js';

export default async function (fastify: FastifyInstance) {
  // POST /bots/:did/refresh-manifest — Trigger manifest re-fetch
  fastify.post<{
    Params: { did: string };
  }>('/bots/:did/refresh-manifest', async (request, reply) => {
    const apiKey = request.headers['x-api-key'] as string;
    if (!apiKey) {
      reply.code(401);
      return { success: false, error: 'Missing x-api-key header' };
    }

    const operator = await authenticateOperator(apiKey, db);
    if (!operator) {
      reply.code(401);
      return { success: false, error: 'Invalid API key' };
    }

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

    if (bot.operatorId !== operator.id) {
      reply.code(403);
      return { success: false, error: 'Not authorized for this bot' };
    }

    await manifestFetchQueue.add('fetch', {
      botId: bot.id,
      did: bot.did,
      manifestUrl: bot.manifestUrl,
    });

    return { success: true, data: { queued: true } };
  });
}
