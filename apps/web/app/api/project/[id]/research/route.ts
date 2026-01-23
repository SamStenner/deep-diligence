import { NextResponse } from "next/server";
import {
  getProjectById,
  getProjectResearchById,
  getSubagentsById,
} from "@/lib/data/db";
import { SubAgentUIMessage } from "@/lib/research/agents/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const research = await getProjectResearchById(id);
    if (!research) {
      return NextResponse.json(
        { error: "Research not found" },
        { status: 404 },
      );
    }

    const subagents = await getSubagentsById(research.id);

    return NextResponse.json({
      research: research.research,
      subagents,
    });
  } catch (error) {
    console.error("Error fetching project research:", error);
    return NextResponse.json(
      { error: "Failed to fetch project research" },
      { status: 500 },
    );
  }
}
