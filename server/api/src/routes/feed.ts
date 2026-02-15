import { FastifyInstance } from 'fastify';
import { BskyAgent } from '@atproto/api';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bots } from '../db/schema.js';

interface FeedPost {
  uri: string;
  text: string;
  createdAt: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatar?: string;
  images?: { thumb: string; alt: string }[];
}

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: {
      did?: string;
      limit?: string;
    };
  }>('/feed', async (request, _reply) => {
    const { did, limit: limitStr = '20' } = request.query;
    const limit = Math.min(parseInt(limitStr, 10) || 20, 50);

    const whereClause = did
      ? and(eq(bots.listingStatus, 'active'), eq(bots.did, did))
      : eq(bots.listingStatus, 'active');

    const activeBots = await db
      .select({
        did: bots.did,
        handle: bots.handle,
        displayName: bots.displayName,
      })
      .from(bots)
      .where(whereClause);

    if (activeBots.length === 0) {
      return { success: true, data: [] };
    }

    const agent = new BskyAgent({ service: 'https://public.api.bsky.app' });

    // Fetch feeds in parallel, tolerating individual failures
    const perBot = did ? limit : Math.min(5, limit);
    const results = await Promise.allSettled(
      activeBots.map(async (bot) => {
        const response = await agent.getAuthorFeed({
          actor: bot.did,
          limit: perBot,
        });

        const posts: FeedPost[] = [];
        for (const item of response.data.feed) {
          const post = item.post;
          const record = post.record as { text?: string; createdAt?: string };

          // Extract images from embed if present
          const images: { thumb: string; alt: string }[] = [];
          const embed = post.embed as {
            $type?: string;
            images?: { thumb: string; alt: string }[];
          } | undefined;
          if (embed?.$type === 'app.bsky.embed.images#view' && embed.images) {
            for (const img of embed.images) {
              images.push({ thumb: img.thumb, alt: img.alt });
            }
          }

          posts.push({
            uri: post.uri,
            text: record.text ?? '',
            createdAt: record.createdAt ?? post.indexedAt,
            authorDid: bot.did,
            authorHandle: bot.handle,
            authorDisplayName: bot.displayName,
            authorAvatar: (post.author as { avatar?: string }).avatar,
            ...(images.length > 0 ? { images } : {}),
          });
        }
        return posts;
      }),
    );

    // Merge all successful results
    const allPosts: FeedPost[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPosts.push(...result.value);
      }
    }

    // Sort by createdAt descending, take top N
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: allPosts.slice(0, limit),
    };
  });
}
