import {
  Bot,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FolderOpen,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/lib/data/db";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    dotColor: string;
  }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  pending_review: {
    label: "Pending Review",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dotColor: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
            <p className="text-lg text-muted-foreground">
              Manage and track your due diligence projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" asChild>
              <Link href="/agents">
                <Bot className="size-4" />
                Agents
              </Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/new">
                <Plus className="size-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {projects.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Briefcase className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 py-16 px-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-6">
              <Building2 className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Get started by creating your first due diligence project to begin
              your research.
            </p>
            <Button size="lg" asChild>
              <Link href="/new">
                <Plus className="size-4" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const status =
                STATUS_CONFIG[project.status] ?? STATUS_CONFIG.draft;
              return (
                <Button variant="outline" key={project.id} asChild>
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full h-fit justify-start shadow-none rounded-xl p-10"
                  >
                    <div className="relative flex items-center gap-5 w-full">
                      {/* Company Icon */}
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                        {project.companyName.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {project.companyName}
                          </h3>
                          <Badge
                            className={`${status.className} border-0 gap-1.5`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${status.dotColor}`}
                            />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="size-3.5" />
                            {project.industry}
                          </span>
                          <span className="text-border">•</span>
                          <span>{project.dealType}</span>
                          {project.dealSize && (
                            <>
                              <span className="text-border">•</span>
                              <span>{project.dealSize}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>
                            {project.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {project.timeline && (
                          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="size-3.5" />
                            <span>{project.timeline}</span>
                          </div>
                        )}
                        <DeleteProjectButton
                          projectId={project.id}
                          projectName={project.companyName}
                        />
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
