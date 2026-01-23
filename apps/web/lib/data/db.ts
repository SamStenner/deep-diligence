import { desc, eq } from "drizzle-orm";
import { projectResearch, SubagentMessage, subagentMessages, SubagentStatus } from "@/lib/data/schema";
import type { AgentUIMessage } from "../research/agents/orchestrator";
import type { SubAgentName, SubAgentUIMessage } from "../research/agents/types";
import { db } from "./client";
import {
  type CreateProjectInput,
  type Project,
  ProjectResearch,
  type ProjectStatus,
  projects,
  Subagent,
  subagents,
} from "./schema";

export const getProjects = async (): Promise<Project[]> => {
  return await db.select().from(projects).orderBy(desc(projects.updatedAt));
};

export const getProjectById = async (
  id: string,
): Promise<Project | undefined> => {
  const projectRecords = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  const project = projectRecords[0];
  if (!project) return undefined;
  return project;
};

export const createProject = async (
  input: CreateProjectInput,
): Promise<Project> => {
  const result = await db
    .insert(projects)
    .values({
      status: "in_progress",
      companyName: input.companyName,
      companyWebsite: input.companyWebsite,
      industry: input.industry,
      foundedYear: input.foundedYear,
      headquarters: input.headquarters,
      employeeCount: input.employeeCount,
      dealType: input.dealType,
      dealSize: input.dealSize,
      investmentThesis: input.investmentThesis,
      existingInfo: input.existingInfo,
      keyQuestions: input.keyQuestions,
      documents: [],
      timeline: input.timeline,
      priorityAreas: input.priorityAreas ?? [],
    })
    .returning();

  return result[0];
};

export const createProjectResearch = async (projectId: string) => {
  const result = await db
    .insert(projectResearch)
    .values({
      projectId,
    })
    .returning();
  return result[0];
};

export const updateProjectResearch = async (
  researchId: string,
  research: AgentUIMessage,
) => {
  return await db
    .update(projectResearch)
    .set({ research, updatedAt: new Date() })
    .where(eq(projectResearch.id, researchId));
};

export type SubagentWithMessages = Subagent & {
  messages: SubagentMessage[];
};

export const getSubagentsById = async (
  researchId: string,
): Promise<SubagentWithMessages[]> => {
  const rows = await db
    .select({
      subagent: subagents,
      message: subagentMessages,
    })
    .from(subagents)
    .leftJoin(subagentMessages, eq(subagents.id, subagentMessages.subagentId))
    .where(eq(subagents.researchId, researchId));

  const subagentMap = new Map<string, SubagentWithMessages>();

  for (const row of rows) {
    if (!subagentMap.has(row.subagent.id)) {
      subagentMap.set(row.subagent.id, {
        ...row.subagent,
        messages: [],
      });
    }
    if (row.message) {
      subagentMap.get(row.subagent.id)!.messages.push(row.message);
    }
  }

  return Array.from(subagentMap.values());
};

export const createSubagent = async (
  researchId: string,
  name: SubAgentName,
) => {
  const result = await db
    .insert(subagents)
    .values({
      researchId,
      name,
      status: "active",
    })
    .returning();
  return result[0];
};

export const updateSubagent = async (
  id: string,
  status: SubagentStatus,
) => {
  return await db
    .update(subagents)
    .set({ status })
    .where(eq(subagents.id, id))
    .returning();
};

export const createSubagentMessage = async (
  subagentId: string,
  message: SubAgentUIMessage,
) => {
  const result = await db.insert(subagentMessages).values({ subagentId, message }).returning();
  return result[0];
};

export const getSubagentMessagesById = async (
  subagentId: string,
): Promise<SubagentMessage[]> => {
  return await db.select().from(subagentMessages).where(eq(subagentMessages.subagentId, subagentId));
};


export const getProjectResearchById = async (
  projectId: string,
): Promise<ProjectResearch> => {
  const projectResearchRecords = await db
    .select()
    .from(projectResearch)
    .where(eq(projectResearch.projectId, projectId));
  return projectResearchRecords[0]
};

export const deleteProject = async (id: string): Promise<void> => {
  await db.delete(projects).where(eq(projects.id, id));
};

export const updateProjectStatus = async (
  id: string,
  status: ProjectStatus,
): Promise<void> => {
  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(eq(projects.id, id));
};
