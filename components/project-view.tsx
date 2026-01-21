"use client";

import * as React from "react";
import {
  ArrowLeftIcon,
  Brain,
  CheckCircle2,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  GalleryVerticalEnd,
  icons,
  Search,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { Project, ProjectResearch, Research } from "@/lib/data/schema";
import { Streamdown } from "streamdown";
import { AgentInput, subAgentRegistry, SubAgentUIMessage } from "@/lib/research/agents/sub.agents";
import { Content } from "./content";
import { isToolUIPart } from "ai";
import { useState } from 'react';

function parseResearch(research: Research) {
  const results = research.parts.filter((p) => isToolUIPart(p));
  const doneResult = results.find((r) => r.type === "tool-done" && r.state === "input-available")
  const outputResults = results.filter((r) => r.state === "output-available");
  const latestPlan = outputResults.findLast((r) => r.type === "tool-updatePlan")?.input.plan
  const subAgents = outputResults.filter((r) => r.type === "tool-spawnAgent").flatMap((r) => {
    return r.input.subAgents.map((input, index) => ({
      id: `${r.toolCallId}-${index}`,
      input,
      output: r.output[index],
    }))
  })
  return {
    plan: latestPlan,
    subAgents,
    status: doneResult ? "completed" : "in_progress",
    report: doneResult?.input.report ?? null
  };
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <Streamdown>
      {content}
    </Streamdown>
  );
}

function SubAgentView({ agent }: { agent: SubAgentUIMessage }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="size-5 text-green-600" />
            Research Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Content parts={agent.parts} />
        </CardContent>
      </Card>
    </div>
  );
}

type ProjectViewProps = {
  project: Project;
  research: ProjectResearch | null;
};

export function ProjectView({ project, research }: ProjectViewProps) {
  if (!research) {
    return <div>Research generating...</div>;
  }
  const parsed = parseResearch(research.research);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const selectedSubAgent = parsed.subAgents.find((a) => a.id === selectedTab);

  return (
    <SidebarProvider className="h-full min-h-screen w-full">
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={selectedTab === null}
                    onClick={() => setSelectedTab(null)}
                  >
                    <Brain className="size-4" />
                    <span>Lead Analyst</span>
                    {parsed.status === "completed" && (
                      <CheckCircle2 className="ml-auto size-4 text-green-600" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Specialist Analysts
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {parsed.subAgents.map((agent) => {
                  const id = agent.input.subAgent
                  const subagent = subAgentRegistry[id];
                  return (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        isActive={selectedTab === agent.id}
                        onClick={() => setSelectedTab(agent.id)}
                      >
                        <Icon icon={subagent.icon} />
                        <span className="truncate">{subagent.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        <header className="flex h-12 shrink-0 sticky top-0 items-center gap-2 border-b px-4 bg-background z-10">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground font-medium">
              {project.companyName}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={parsed.status === "completed" ? "default" : "secondary"}
              className={cn(
                parsed.status === "completed" &&
                "bg-green-600 hover:bg-green-700"
              )}
            >
              {parsed.status === "completed" ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-6xl mx-auto">
            {selectedTab === null ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {project.companyName}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    AI-powered due diligence research orchestrated by the lead analyst
                  </p>
                </div>
                {parsed.status === "completed" && parsed.report !== null && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="size-5 text-green-600" />
                        Research Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownContent content={parsed.report} />
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : selectedSubAgent ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Agent Research
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Specialized research agent for {project.companyName}
                  </p>
                </div>

                <SubAgentView agent={selectedSubAgent.output} />
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}


function Icon({ icon }: { icon: AgentInput["icon"] }): React.ReactNode {
  const Icon = icons[icon];
  return <Icon className="size-4" />;
}

export function TeamSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Adam AI Labs</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
