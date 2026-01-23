import { tasks } from "@trigger.dev/sdk/v3";
import { NextResponse } from "next/server";
import { createProject, createProjectResearch } from "@/lib/data/db";
import type { CreateProjectInput } from "@/lib/data/schema";
import type { researchTask } from "@/trigger/research.task";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProjectInput;

    if (!body.companyName || !body.industry || !body.dealType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: companyName, industry, and dealType are required",
        },
        { status: 400 },
      );
    }

    const project = await createProject(body);

    const research = await createProjectResearch(project.id);

    // Trigger the research task via Trigger.dev
    // This runs durably in a separate process and can wait for external events
    const handle = await tasks.trigger<typeof researchTask>("research-run", {
      projectId: project.id,
      researchId: research.id,
    });

    console.log("Project created:", project.id);
    console.log("Research task triggered:", handle.id);

    return NextResponse.json(
      {
        ...project,
        taskId: handle.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
