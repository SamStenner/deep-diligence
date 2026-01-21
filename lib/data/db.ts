import { db } from "./client";
import { CreateProjectInput, Research, Project, projects, ProjectResearch } from "./schema";
import { eq, desc } from "drizzle-orm";
import { projectResearch } from '@/lib/data/schema';

export const getProjects = async (): Promise<Project[]> => {
  return await db.select().from(projects).orderBy(desc(projects.updatedAt));
};

export const getProjectById = async (
  id: string,
): Promise<Project | undefined> => {
  console.log("Getting project by id:", id);
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

export const createProjectResearch = async (projectId: string, research: Research) => {
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