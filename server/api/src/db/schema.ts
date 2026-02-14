import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Operators ────────────────────────────────────────────────────────────────

export const operators = pgTable('operators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Bots ─────────────────────────────────────────────────────────────────────

export const bots = pgTable('bots', {
  id: uuid('id').primaryKey().defaultRandom(),
  did: varchar('did', { length: 255 }).notNull().unique(),
  handle: varchar('handle', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description').default(''),
  operatorId: uuid('operator_id').references(() => operators.id),
  categories: jsonb('categories').default([]),
  manifestUrl: varchar('manifest_url', { length: 1024 }),
  listingStatus: varchar('listing_status', { length: 20 }).default('draft'),
  trustBadge: varchar('trust_badge', { length: 20 }).default('none'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Manifests ────────────────────────────────────────────────────────────────

export const manifests = pgTable('manifests', {
  botId: uuid('bot_id')
    .primaryKey()
    .references(() => bots.id),
  rawJson: jsonb('raw_json').notNull(),
  schemaVersion: varchar('schema_version', { length: 10 }).default('1.0'),
  validatedAt: timestamp('validated_at'),
  errors: jsonb('errors').default([]),
  interactionModes: jsonb('interaction_modes').default([]),
  dmEnabled: boolean('dm_enabled').default(false),
  dmRetention: varchar('dm_retention', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ── Commands ─────────────────────────────────────────────────────────────────

export const commands = pgTable(
  'commands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    botId: uuid('bot_id')
      .references(() => bots.id)
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').default(''),
    argsSchema: jsonb('args_schema'),
    exampleMention: varchar('example_mention', { length: 500 }),
    responseContract: varchar('response_contract', { length: 500 }),
  },
  (table) => ({
    botCommandUnique: uniqueIndex('commands_bot_id_name_idx').on(table.botId, table.name),
  }),
);

// ── Verification Challenges ──────────────────────────────────────────────────

export const verificationChallenges = pgTable('verification_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  botId: uuid('bot_id')
    .references(() => bots.id)
    .notNull(),
  nonce: varchar('nonce', { length: 64 }).notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  evidenceUri: varchar('evidence_uri', { length: 1024 }),
});

// ── Reputation Metrics ───────────────────────────────────────────────────────

export const reputationMetrics = pgTable('reputation_metrics', {
  botId: uuid('bot_id')
    .primaryKey()
    .references(() => bots.id),
  responsivenessMs: integer('responsiveness_ms'),
  manifestCompletenessPct: integer('manifest_completeness_pct').default(0),
  reportCount: integer('report_count').default(0),
  lastSeenAt: timestamp('last_seen_at'),
});
