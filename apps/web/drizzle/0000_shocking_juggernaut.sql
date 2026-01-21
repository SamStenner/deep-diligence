CREATE TYPE "public"."deal_type" AS ENUM('acquisition', 'investment', 'merger', 'partnership', 'other');--> statement-breakpoint
CREATE TYPE "public"."industry_type" AS ENUM('technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'energy', 'real_estate', 'consumer_goods', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "project_researches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb NOT NULL
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
ALTER TABLE "project_researches" ADD CONSTRAINT "project_researches_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;