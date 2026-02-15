import { eq } from 'drizzle-orm';
import { bots } from '../db/schema.js';
import type { Database } from '../db/index.js';

export async function authenticateBot(did: string, listingSecret: string, db: Database) {
  const results = await db
    .select()
    .from(bots)
    .where(eq(bots.did, did))
    .limit(1);

  const bot = results[0];
  if (!bot || bot.listingSecret !== listingSecret) return null;

  return bot;
}
