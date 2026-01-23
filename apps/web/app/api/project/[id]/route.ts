import { NextResponse } from "next/server";
import { deleteProject, getProjectById } from "@/lib/data/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await deleteProject(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
