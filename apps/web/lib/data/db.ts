import { db } from "./client";
import { CreateProjectInput, Project, projects, ProjectResearch, ProjectStatus } from "./schema";
import { eq, desc } from "drizzle-orm";
import { projectResearch } from '@/lib/data/schema';
import { AgentUIMessage } from "../research/agents/orchestrator";

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

export const createProjectResearch = async (projectId: string, research: AgentUIMessage) => {
  return await db.insert(projectResearch).values({
    projectId,
    research
  });
};

export const getProjectResearchById = async (projectId: string): Promise<ProjectResearch | undefined> => {
  const projectResearchRecords = await db
    .select()
    .from(projectResearch)
    .where(eq(projectResearch.projectId, projectId));
  return projectResearchRecords[0];
};

export const deleteProject = async (id: string): Promise<void> => {
  await db.delete(projects).where(eq(projects.id, id));
};

export const updateProjectStatus = async (id: string, status: ProjectStatus): Promise<void> => {
  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(eq(projects.id, id));
};