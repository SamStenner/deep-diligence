CREATE TYPE "public"."phone_status" AS ENUM('pending', 'completed', 'failed', 'timeout', 'no_answer');--> statement-breakpoint
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
ALTER TABLE "email_conversations" DROP CONSTRAINT "email_conversations_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_researches" DROP CONSTRAINT "project_researches_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "phone_conversations" ADD CONSTRAINT "phone_conversations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_conversations" ADD CONSTRAINT "email_conversations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_researches" ADD CONSTRAINT "project_researches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;