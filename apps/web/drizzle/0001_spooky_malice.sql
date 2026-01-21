CREATE TYPE "public"."email_status" AS ENUM('pending', 'replied', 'timeout', 'failed');--> statement-breakpoint
CREATE TABLE "email_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"email_id" text,
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
ALTER TABLE "email_conversations" ADD CONSTRAINT "email_conversations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;