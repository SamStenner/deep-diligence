"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Project } from "@/lib/data/schema";
import type { AgentUIMessage } from "@/lib/research/agents/orchestrator";
import type { SubAgentUIMessage } from "@/lib/research/agents/types";
import { ProjectView, SubAgentMessageData } from "./project-view";
import { SubagentWithMessages } from "@/lib/data/db";
import { useState } from "react";

type ProjectResearchData = {
  research: AgentUIMessage | null;
  subagents: SubagentWithMessages[];
};

async function fetchProjectResearch(
  projectId: string,
): Promise<ProjectResearchData> {
  const response = await fetch(`/api/project/${projectId}/research`);
  if (!response.ok) {
    throw new Error("Failed to fetch project research");
  }
  return response.json();
}

type ProjectViewClientProps = {
  project: Project;
  initialData: ProjectResearchData;
};

export function ProjectViewClient({
  project,
  initialData,
}: ProjectViewClientProps) {
  const [enabled, setEnabled] = useState(!initialData.research);
  const { data, isLoading, error } = useQuery({
    queryKey: ["project-research", project.id],
    queryFn: async () => {
      const response = await fetchProjectResearch(project.id);
      setEnabled(!response.research);
      return response;
    },
    initialData,
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is focused
    enabled
  });

  if (isLoading && !data) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-destructive">Failed to load research data</p>
      </div>
    );
  }

  return (
    <ProjectView
      project={project}
      subagents={data.subagents}
      research={data.research}
    />
  );
}
