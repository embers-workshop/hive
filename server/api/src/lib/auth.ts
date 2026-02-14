import { eq } from 'drizzle-orm';
import { operators } from '../db/schema.js';
import type { Database } from '../db/index.js';

export async function authenticateOperator(apiKey: string, db: Database) {
  const results = await db
    .select()
    .from(operators)
    .where(eq(operators.apiKey, apiKey))
    .limit(1);

  return results[0] ?? null;
}
