import { NextResponse } from "next/server";
import { createProject, createProjectResearch } from "@/lib/data/db";
import { projectResearch, type CreateProjectInput } from "@/lib/data/schema";
import { generate } from "@/lib/research";
import { generateId, streamText } from "ai";
import { after } from "next/server";
import { db } from "@/lib/data/client";

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
    after(async () => {
      console.log("Generating research for project:", project.id);
      const result = await generate(project.id);
      console.log("Research generated:", result);
      await createProjectResearch(project.id, result);
      console.log("Research created");
    });
    console.log("Project created:", project);
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
