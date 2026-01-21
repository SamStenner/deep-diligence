import { GenerateTextResult } from "ai";
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { generate } from "../research";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "in_progress",
  "completed",
]);

export const industryTypeEnum = pgEnum("industry_type", [
  "technology",
  "healthcare",
  "finance",
  "retail",
  "manufacturing",
  "energy",
  "real_estate",
  "consumer_goods",
  "other",
]);

export const dealTypeEnum = pgEnum("deal_type", [
  "acquisition",
  "investment",
  "merger",
  "partnership",
  "other",
]);

export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type IndustryType = (typeof industryTypeEnum.enumValues)[number];
export type DealType = (typeof dealTypeEnum.enumValues)[number];

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: projectStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Company information
  companyName: text("company_name").notNull(),
  companyWebsite: text("company_website"),
  industry: industryTypeEnum("industry").notNull(),
  foundedYear: integer("founded_year"),
  headquarters: text("headquarters"),
  employeeCount: text("employee_count"),

  // Deal context
  dealType: dealTypeEnum("deal_type").notNull(),
  dealSize: text("deal_size"),
  investmentThesis: text("investment_thesis"),

  // Existing information
  existingInfo: text("existing_info"),
  keyQuestions: text("key_questions"),

  // Documents stored as JSONB array
  documents: jsonb("documents").$type<UploadedDocument[]>().default([]),

  // Additional context
  timeline: text("timeline"),
  priorityAreas: jsonb("priority_areas").$type<string[]>().default([]),
});

export type Project = typeof projects.$inferSelect;

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: "financials" | "legal" | "technical" | "market" | "team" | "other";
};


export type CreateProjectInput = Omit<
  Project,
  "id" | "status" | "createdAt" | "updatedAt" | "documents"
> & {
  documents?: File[];
};

export const projectResearch = pgTable("project_researches", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  research: jsonb("data").$type<Research>().notNull(),
});

export type ProjectResearch = typeof projectResearch.$inferSelect;

export type Research = Awaited<ReturnType<typeof generate>>;