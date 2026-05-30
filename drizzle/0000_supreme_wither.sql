CREATE TYPE "public"."division" AS ENUM('D1', 'D2', 'D3', 'NAIA', 'NJCAA');--> statement-breakpoint
CREATE TYPE "public"."outreach_status" AS ENUM('DRAFT', 'APPROVED', 'SENT', 'OPENED', 'REPLIED', 'ESCALATED', 'BLOCKED');--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_id" text NOT NULL,
	"full_name" text NOT NULL,
	"country" text NOT NULL,
	"native_language" text DEFAULT 'es' NOT NULL,
	"is_minor" boolean NOT NULL,
	"parental_consent" boolean NOT NULL,
	"sport" text NOT NULL,
	"position" text NOT NULL,
	"positions" jsonb NOT NULL,
	"grad_year" integer NOT NULL,
	"height_cm" integer NOT NULL,
	"dominant_foot" text NOT NULL,
	"gpa_equivalent" double precision NOT NULL,
	"stats" jsonb NOT NULL,
	"video_url" text NOT NULL,
	"english_test" jsonb NOT NULL,
	"ncaa_center_status" text DEFAULT 'MANUAL_REVIEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreaches" (
	"id" text PRIMARY KEY NOT NULL,
	"athlete_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"program_id" text NOT NULL,
	"status" "outreach_status" DEFAULT 'DRAFT' NOT NULL,
	"match_score" double precision NOT NULL,
	"match_reasons" jsonb NOT NULL,
	"subject_line" text NOT NULL,
	"draft_email_en" text NOT NULL,
	"one_pager_en" text NOT NULL,
	"thread" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_follow_up_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"replied_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"school" text NOT NULL,
	"division" "division" NOT NULL,
	"conference" text,
	"state" text NOT NULL,
	"sport" text NOT NULL,
	"level" text NOT NULL,
	"roster_needs" jsonb NOT NULL,
	"intl_friendly" boolean NOT NULL,
	"academic_min_gpa" double precision NOT NULL,
	"notes" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreaches" ADD CONSTRAINT "outreaches_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreaches" ADD CONSTRAINT "outreaches_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreaches" ADD CONSTRAINT "outreaches_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;