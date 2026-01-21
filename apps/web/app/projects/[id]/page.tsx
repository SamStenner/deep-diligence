import { getProjectById, getProjectResearchById } from "@/lib/data/db";
import { ProjectView } from "@/components/project-view";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) {
    return <div>Project not found</div>;
  }
  const research = await getProjectResearchById(id) ?? null
  return (
    <div className="h-screen w-full">
      <ProjectView project={project} research={research} />
    </div>
  );
}