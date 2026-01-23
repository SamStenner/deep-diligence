CREATE TYPE "public"."deal_type" AS ENUM('acquisition', 'investment', 'merger', 'partnership', 'other');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'replied', 'timeout', 'failed');--> statement-breakpoint
CREATE TYPE "public"."industry_type" AS ENUM('technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'energy', 'real_estate', 'consumer_goods', 'other');--> statement-breakpoint
CREATE TYPE "public"."phone_status" AS ENUM('pending', 'completed', 'failed', 'timeout', 'no_answer');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "email_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"email_id" text,
	"message_id" text,
	"wait_token_id" text,
	"recipient_email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"replied_at" timestamp with time zone,
	"reply_content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phone_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"conversation_id" text NOT NULL,
	"call_sid" text,
	"wait_token_id" text,
	"to_number" text NOT NULL,
	"agent_id" text NOT NULL,
	"status" "phone_status" DEFAULT 'pending' NOT NULL,
	"transcript" jsonb,
	"analysis" jsonb,
	"call_duration_secs" integer,
	"termination_reason" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_researches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"company_name" text NOT NULL,
	"company_website" text,
	"industry" "industry_type" NOT NULL,
	"founded_year" integer,
	"headquarters" text,
	"employee_count" text,
	"deal_type" "deal_type" NOT NULL,
	"deal_size" text,
	"investment_thesis" text,
	"existing_info" text,
	"key_questions" text,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"timeline" text,
	"priority_areas" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "subagent_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subagent_id" uuid NOT NULL,
	"message" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subagents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_conversations" ADD CONSTRAINT "email_conversations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_conversations" ADD CONSTRAINT "phone_conversations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_researches" ADD CONSTRAINT "project_researches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subagent_messages" ADD CONSTRAINT "subagent_messages_subagent_id_subagents_id_fk" FOREIGN KEY ("subagent_id") REFERENCES "public"."subagents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subagents" ADD CONSTRAINT "subagents_research_id_project_researches_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."project_researches"("id") ON DELETE cascade ON UPDATE no action;