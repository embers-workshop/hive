CREATE TABLE "bots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"did" varchar(255) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text DEFAULT '',
	"listing_secret" varchar(64) NOT NULL,
	"operator_name" varchar(255),
	"operator_email" varchar(255),
	"categories" jsonb DEFAULT '[]'::jsonb,
	"manifest_url" varchar(1024),
	"listing_status" varchar(20) DEFAULT 'draft',
	"trust_badge" varchar(20) DEFAULT 'none',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bots_did_unique" UNIQUE("did")
);
--> statement-breakpoint
CREATE TABLE "commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text DEFAULT '',
	"args_schema" jsonb,
	"example_mention" varchar(500),
	"response_contract" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "manifests" (
	"bot_id" uuid PRIMARY KEY NOT NULL,
	"raw_json" jsonb NOT NULL,
	"schema_version" varchar(10) DEFAULT '1.0',
	"validated_at" timestamp,
	"errors" jsonb DEFAULT '[]'::jsonb,
	"interaction_modes" jsonb DEFAULT '[]'::jsonb,
	"dm_enabled" boolean DEFAULT false,
	"dm_retention" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reputation_metrics" (
	"bot_id" uuid PRIMARY KEY NOT NULL,
	"responsiveness_ms" integer,
	"manifest_completeness_pct" integer DEFAULT 0,
	"report_count" integer DEFAULT 0,
	"last_seen_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bot_id" uuid NOT NULL,
	"nonce" varchar(64) NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"evidence_uri" varchar(1024)
);
--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manifests" ADD CONSTRAINT "manifests_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_metrics" ADD CONSTRAINT "reputation_metrics_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_challenges" ADD CONSTRAINT "verification_challenges_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "commands_bot_id_name_idx" ON "commands" USING btree ("bot_id","name");
