import { FastifyInstance } from 'fastify';
import { eq, ilike, and, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bots, operators, reputationMetrics, manifests, commands } from '../db/schema.js';
import { authenticateOperator } from '../lib/auth.js';
import { manifestFetchQueue } from '../lib/queue.js';

export default async function (fastify: FastifyInstance) {
  // GET /bots — Public listing
  fastify.get<{
    Querystring: {
      category?: string;
      search?: string;
      trust_badge?: string;
      listing_status?: string;
      limit?: string;
      offset?: string;
    };
  }>('/bots', async (request, _reply) => {
    const {
      category,
      search,
      trust_badge,
      listing_status = 'active',
      limit: limitStr = '20',
      offset: offsetStr = '0',
    } = request.query;

    const limit = Math.min(parseInt(limitStr, 10) || 20, 100);
    const offset = parseInt(offsetStr, 10) || 0;

    const conditions = [];

    conditions.push(eq(bots.listingStatus, listing_status));

    if (category) {
      conditions.push(sql`${bots.categories} @> ${JSON.stringify([category])}::jsonb`);
    }

    if (search) {
      conditions.push(
        sql`(${ilike(bots.displayName, `%${search}%`)} OR ${ilike(bots.description, `%${search}%`)})`,
      );
    }

    if (trust_badge) {
      conditions.push(eq(bots.trustBadge, trust_badge));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select({
          bot: bots,
          operator_name: operators.name,
          reputation: reputationMetrics,
        })
        .from(bots)
        .leftJoin(operators, eq(bots.operatorId, operators.id))
        .leftJoin(reputationMetrics, eq(bots.id, reputationMetrics.botId))
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(bots)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: results.map((r) => ({
        ...r.bot,
        operator_name: r.operator_name,
        reputation: r.reputation,
      })),
      total: countResult[0].count,
      offset,
      limit,
    };
  });

  // GET /bots/:did — Bot detail
  fastify.get<{
    Params: { did: string };
  }>('/bots/:did', async (request, reply) => {
    const { did } = request.params;

    const botRows = await db
      .select({
        bot: bots,
        operator: operators,
        reputation: reputationMetrics,
        manifest: manifests,
      })
      .from(bots)
      .leftJoin(operators, eq(bots.operatorId, operators.id))
      .leftJoin(reputationMetrics, eq(bots.id, reputationMetrics.botId))
      .leftJoin(manifests, eq(bots.id, manifests.botId))
      .where(eq(bots.did, did))
      .limit(1);

    if (botRows.length === 0) {
      reply.code(404);
      return { success: false, error: 'Bot not found' };
    }

    const row = botRows[0];

    const botCommands = await db
      .select()
      .from(commands)
      .where(eq(commands.botId, row.bot.id));

    return {
      success: true,
      data: {
        ...row.bot,
        operator: row.operator,
        manifest: row.manifest,
        commands: botCommands,
        reputation: row.reputation,
      },
    };
  });

  // POST /bots — Create bot listing
  fastify.post<{
    Body: {
      did: string;
      handle: string;
      display_name: string;
      description?: string;
      categories?: string[];
      manifest_url?: string;
    };
  }>('/bots', async (request, reply) => {
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

    const { did, handle, display_name, description, categories, manifest_url } = request.body;

    const [bot] = await db
      .insert(bots)
      .values({
        did,
        handle,
        displayName: display_name,
        description: description ?? '',
        operatorId: operator.id,
        categories: categories ?? [],
        manifestUrl: manifest_url ?? null,
      })
      .returning();

    if (manifest_url) {
      await manifestFetchQueue.add('fetch', {
        botId: bot.id,
        did: bot.did,
        manifestUrl: manifest_url,
      });
    }

    reply.code(201);
    return { success: true, data: bot };
  });

  // PATCH /bots/:did — Update listing
  fastify.patch<{
    Params: { did: string };
    Body: {
      handle?: string;
      display_name?: string;
      description?: string;
      categories?: string[];
      manifest_url?: string;
      listing_status?: string;
    };
  }>('/bots/:did', async (request, reply) => {
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

    const existing = await db
      .select()
      .from(bots)
      .where(eq(bots.did, did))
      .limit(1);

    if (existing.length === 0) {
      reply.code(404);
      return { success: false, error: 'Bot not found' };
    }

    if (existing[0].operatorId !== operator.id) {
      reply.code(403);
      return { success: false, error: 'Not authorized to update this bot' };
    }

    const { handle, display_name, description, categories, manifest_url, listing_status } =
      request.body;

    const updates: Record<string, unknown> = {};
    if (handle !== undefined) updates.handle = handle;
    if (display_name !== undefined) updates.displayName = display_name;
    if (description !== undefined) updates.description = description;
    if (categories !== undefined) updates.categories = categories;
    if (manifest_url !== undefined) updates.manifestUrl = manifest_url;
    if (listing_status !== undefined) updates.listingStatus = listing_status;
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(bots)
      .set(updates)
      .where(eq(bots.did, did))
      .returning();

    return { success: true, data: updated };
  });
}
