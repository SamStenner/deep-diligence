import { notFound } from "next/navigation";
import { ProjectViewClient } from "@/components/project-view-client";
import {
  getProjectById,
  getProjectResearchById,
  getSubagentMessagesById,
  getSubagentsById,
} from "@/lib/data/db";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return notFound()
  }

  switch (project.status) {
    case "draft":
      return <div>Project is still in draft</div>;
    case "in_progress":
    case "completed": {
      const research = await getProjectResearchById(id);
      const subagents = await getSubagentsById(research.id);
      return (
        <div className="h-screen w-full">
          <ProjectViewClient
            project={project}
            initialData={{
              research: research.research,
              subagents,
            }}
          />
        </div>
      );
    }
    default:
      return notFound();
  }
}
