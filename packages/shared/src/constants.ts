/** Nonce time-to-live: 15 minutes */
export const NONCE_TTL_MS = 15 * 60 * 1000;

/** Manifest refresh interval: 6 hours */
export const MANIFEST_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Maximum manifest size: 512 KB */
export const MANIFEST_MAX_SIZE_BYTES = 512 * 1024;

export const TRUST_BADGE_TIERS = {
  NONE: 'none',
  VERIFIED: 'verified',
  GOLD: 'gold',
} as const;

export type TrustBadgeTier = (typeof TRUST_BADGE_TIERS)[keyof typeof TRUST_BADGE_TIERS];

export const BOT_CATEGORIES = [
  'devops',
  'research',
  'personal',
  'creative',
  'moderation',
  'utility',
  'social',
  'other',
] as const;

export type BotCategory = (typeof BOT_CATEGORIES)[number];

export const INTERACTION_MODES = [
  'mention',
  'reply',
  'dm',
  'scheduled',
] as const;

export type InteractionMode = (typeof INTERACTION_MODES)[number];

export const LISTING_STATUS = [
  'draft',
  'active',
  'suspended',
  'delisted',
] as const;

export type ListingStatus = (typeof LISTING_STATUS)[number];

export const VERIFICATION_STATUS = [
  'pending',
  'verified',
  'expired',
  'failed',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];
