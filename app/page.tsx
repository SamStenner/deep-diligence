import Link from "next/link";
import { Plus, Building2, Calendar, ArrowRight, Bot } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjects } from "@/lib/data/db";

const STATUS_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  pending_review: { label: "Pending Review", variant: "secondary" },
  completed: { label: "Completed", variant: "secondary" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your due diligence projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/agents">
                <Bot className="size-4" />
                Agents
              </Link>
            </Button>
            <Button asChild>
              <Link href="/new">
                <Plus className="size-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <Building2 className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first due diligence project
              </p>
              <Button asChild>
                <Link href="/new">
                  <Plus className="size-4" />
                  New Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {
              const status =
                STATUS_LABELS[project.status] ?? STATUS_LABELS.draft;
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {project.companyName}
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {project.industry} · {project.dealType}
                            {project.dealSize && ` · ${project.dealSize}`}
                          </CardDescription>
                        </div>
                        <ArrowRight className="size-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          <span>
                            Created{" "}
                            {project.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {project.timeline && (
                          <span>Timeline: {project.timeline}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
