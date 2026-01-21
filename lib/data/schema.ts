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

// Email conversation status enum
export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "replied",
  "timeout",
  "failed",
]);

export type EmailStatus = (typeof emailStatusEnum.enumValues)[number];

// Track email conversations for the contact agent
export const emailConversations = pgTable("email_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  emailId: text("email_id"), // ID from the email provider (Resend)
  messageId: text("message_id"), // RFC 5322 Message-ID header for threading
  waitTokenId: text("wait_token_id"), // Trigger.dev wait token ID
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: emailStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  repliedAt: timestamp("replied_at", { withTimezone: true }),
  replyContent: text("reply_content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EmailConversation = typeof emailConversations.$inferSelect;