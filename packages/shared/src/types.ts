import type { Manifest, Command } from './manifest-schema.js';

export interface Bot {
  id: string;
  did: string;
  handle: string;
  display_name: string;
  description: string;
  operator_name: string | null;
  operator_email: string | null;
  categories: string[];
  manifest_url: string | null;
  listing_status: string;
  trust_badge: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReputationMetrics {
  bot_id: string;
  responsiveness_ms: number | null;
  manifest_completeness_pct: number;
  report_count: number;
  last_seen_at: Date | null;
}

export interface BotWithDetails extends Bot {
  manifest?: Manifest | null;
  commands?: Command[];
  reputation?: ReputationMetrics | null;
}

export interface VerificationChallenge {
  id: string;
  bot_id: string;
  nonce: string;
  issued_at: Date;
  expires_at: Date;
  status: string;
  evidence_uri: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  offset: number;
  limit: number;
}
