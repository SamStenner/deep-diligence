"use client";

import * as React from "react";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  icons,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project, ProjectResearch } from "@/lib/data/schema";
import { Streamdown } from "streamdown";
import { SubAgent, type SubAgentUIMessage } from "@/lib/research/agents/types";
import { Content } from "./content";
import { isToolUIPart } from "ai";
import { HTMLAttributes, useEffect, useState } from 'react';
import { AgentIcon, subAgentPropertiesRegistry } from "@/lib/research/agents/agent.properties";
import { BackdropCard } from "./ui/backdrop-card";
import { ThemeToggle } from "./ui/theme-toggle";
import { useTheme } from "next-themes";
import { StatsGauges } from "./ui/gauge-chart";
import { AgentUIMessage } from "@/lib/research/agents/orchestrator";

type ProcessStep = {
  id: string;
  toolName: string;
  type: "updatePlan" | "checkPlan" | "spawnAgent" | "done";
  input: unknown;
  output: unknown;
  isCompleted: boolean;
};

function parseResearch(research: AgentUIMessage) {
  const results = research.parts.filter((p) => isToolUIPart(p));
  const doneResult = results.find((r) => r.type === "tool-done" && r.state === "output-available")
  const outputResults = results.filter((r) => r.state === "output-available");
  const latestPlan = outputResults.findLast((r) => r.type === "tool-updatePlan")?.input.plan
  const subAgents = outputResults.filter((r) => r.type === "tool-spawnAgent").flatMap((r) => {
    return r.input.subAgents.map((input, index) => ({
      id: `${r.toolCallId}-${index}`,
      input,
      output: r.output[index],
    }))
  })

  // Extract all process steps in order
  const processSteps: ProcessStep[] = results
    .filter((r) => ["tool-updatePlan", "tool-checkPlan", "tool-spawnAgent", "tool-done"].some(t => r.type === t))
    .map((r) => {
      const toolType = r.type.replace("tool-", "") as ProcessStep["type"];
      return {
        id: r.toolCallId,
        toolName: r.type,
        type: toolType,
        input: r.input,
        output: r.state === "output-available" ? r.output : undefined,
        isCompleted: r.state === "output-available",
      };
    });

  return {
    plan: latestPlan,
    subAgents,
    processSteps,
    status: (doneResult ? "completed" : "in_progress") as "completed" | "in_progress",
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
  console.log("agent", agent);
  return (
    <div className="space-y-3 bg-card p-6 rounded-xl h-full">
      <Content parts={agent.parts} />
    </div>
  );
}

type ProcessTimelineProps = {
  processSteps: ProcessStep[];
};

const stepConfig: Record<ProcessStep["type"], { icon: AgentIcon; label: string; getDescription: (input: unknown) => string }> = {
  updatePlan: {
    icon: "ClipboardList",
    label: "Update Plan",
    getDescription: () => "Updated the research plan",
  },
  checkPlan: {
    icon: "ClipboardCheck",
    label: "Check Plan",
    getDescription: () => "Reviewed current plan status",
  },
  spawnAgent: {
    icon: "Users",
    label: "Spawn Agents",
    getDescription: () => "Delegated tasks to specialist agents",
  },
  done: {
    icon: "FileText",
    label: "Generate Report",
    getDescription: () => "Synthesized findings into final report",
  },
};

function ProcessTimeline({ processSteps }: ProcessTimelineProps) {
  if (processSteps.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        <Loader2 className="size-5 animate-spin mx-auto mb-2" />
        <p className="text-sm">Starting research process...</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {processSteps.map((step, index) => {
        const config = stepConfig[step.type];
        const isLast = index === processSteps.length - 1;
        const spawnedAgents = step.type === "spawnAgent"
          ? (step.input as { subAgents: Array<{ subAgent: string; prompt: string }> }).subAgents
          : [];

        return (
          <div key={step.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center size-8 rounded-full bg-card border shadow-sm">
                {step.isCompleted ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <Loader2 className="size-4 text-muted-foreground animate-spin" />
                )}
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border min-h-8" />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={config.icon} className="size-4 text-muted-foreground" />
                <span className="font-medium text-sm">{config.label}</span>
                {!step.isCompleted && (
                  <span className="text-xs text-muted-foreground">In progress...</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {config.getDescription(step.input)}
              </p>

              {/* Spawned agents list */}
              {step.type === "spawnAgent" && spawnedAgents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {spawnedAgents.map((agent, agentIndex) => {
                    const agentProps = subAgentPropertiesRegistry[agent.subAgent as keyof typeof subAgentPropertiesRegistry];
                    return (
                      <div
                        key={agentIndex}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border text-xs"
                      >
                        <Icon
                          icon={agentProps?.icon ?? "Bot"}
                          className="size-3 text-muted-foreground shrink-0"
                        />
                        <span className="font-medium">
                          {agentProps?.name ?? agent.subAgent}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type ProjectViewProps = {
  project: Project;
  research: ProjectResearch | null;
};

export function ProjectView({ project, research }: ProjectViewProps) {
  if (!research) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Generating research...</span>
        </div>
      </div>
    );
  }

  const parsed = parseResearch(research.research);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const selectedSubAgentMessage = parsed.subAgents.find((a) => a.id === selectedTab);
  const subAgentProperties = selectedSubAgentMessage ? subAgentPropertiesRegistry[selectedSubAgentMessage.input.subAgent] : null;
  const images = selectedSubAgentMessage ? (subAgentImages[selectedSubAgentMessage.input.subAgent] ?? subAgentImages.default) : null;
  const { resolvedTheme } = useTheme();


  useEffect(() => {
    setMounted(true);
  }, []);

  // Use "light" as default during SSR to prevent hydration mismatch
  const theme = mounted ? (resolvedTheme as "light" | "dark") : "light";
  const subImage = images?.[theme] ?? images?.light;
  const leadAgentImage = leadAgentImages[theme];
  return (
    <SidebarProvider className="h-full w-full">
      <Sidebar className="border-r border-border/50" collapsible="icon">
        <SidebarHeader className="border-b border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
                <div className="flex items-center justify-center size-8 rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{project.companyName}</span>
                  <span className="text-xs text-muted-foreground">Research Report</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
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
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>
              Specialists
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {parsed.subAgents.map((agent) => {
                  const id = agent.input.subAgent
                  const subagent = subAgentPropertiesRegistry[id];
                  return (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        isActive={selectedTab === agent.id}
                        onClick={() => setSelectedTab(agent.id)}
                      >
                        <Icon icon={subagent.icon} className="size-4" />
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

      <SidebarInset className="flex flex-col bg-muted/30">
        <header className="flex h-14 shrink-0 sticky top-0 items-center gap-3 border-b border-border/50 px-6 bg-background/80 backdrop-blur-sm z-10">
          <SidebarTrigger className="-ml-2" />
          <div className="h-4 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <span className="font-medium">
              {project.companyName}
            </span>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement share functionality
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="size-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="size-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.print()}>
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z" />
                    <path d="M8 12h8v2H8zm0 4h8v2H8z" />
                  </svg>
                  <span>PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // TODO: Implement Google Docs export
                  console.log("Export to Google Docs");
                }}>
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-2.727H7.091v-1.364h9.818v1.364zm0-2.728H7.091V10.364h9.818v1.363zM14.727 6h5.454l-5.454-5.454V6z" />
                  </svg>
                  <span>Google Docs</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // TODO: Implement Word export
                  console.log("Export to Word");
                }}>
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v16.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h10.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V7.5L15.5 2z" />
                    <path d="M15 2v6h6" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M7 13.5L8.5 18l1.5-4.5L11.5 18 13 13.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Microsoft Word</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </header>

        {selectedTab === null ? (
          <BackdropCard
            imageAlt="Lead Analyst"
            imageSrc={leadAgentImage}
            rootClassName="p-6"
            className="p-10 max-w-6xl"
          >
            <div className="space-y-6">
              {/* Stats Gauges */}
              <StatsGauges
                stats={[
                  {
                    label: "Confidence",
                    value: 87,
                    color: "hsl(142, 76%, 36%)",
                  },
                  {
                    label: "Verification",
                    value: 92,
                    color: "hsl(221, 83%, 53%)",
                  },
                  {
                    label: "Risk Level",
                    value: 24,
                    color: "hsl(47, 96%, 53%)",
                  },
                  {
                    label: "Data Quality",
                    value: 78,
                    color: "hsl(262, 83%, 58%)",
                  },
                ]}
                className="bg-card/80 backdrop-blur-sm rounded-xl p-6"
              />

              <Tabs defaultValue="report" className="w-full">
                <TabsList>
                  <TabsTrigger value="report">Report</TabsTrigger>
                  <TabsTrigger value="process">Process</TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                  {parsed.report !== null ? (
                    <div className="p-6 rounded-xl bg-card">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <MarkdownContent content={parsed.report} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-card text-center text-muted-foreground">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Report is being generated...</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="process">
                  <div className="p-6 rounded-xl bg-card">
                    <ProcessTimeline processSteps={parsed.processSteps} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </BackdropCard>
        ) : selectedSubAgentMessage ? (
          <BackdropCard imageAlt="New Project" imageSrc={subImage!} rootClassName="p-6" className="p-10 max-w-4xl 2xl:max-w-6xl" imageClassName="">
            <div className="space-y-6">
              <div className="space-y-2 bg-card p-6 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-muted border shadow-inner">
                    <Icon icon={subAgentProperties!.icon} className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {subAgentProperties!.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {subAgentProperties!.description}
                    </p>
                  </div>
                </div>
              </div>

              <SubAgentView agent={selectedSubAgentMessage.output} />
            </div>
          </BackdropCard>
        ) : null}
      </SidebarInset>
    </SidebarProvider>
  );
}

type ImageTheme = Record<"light" | "dark", string>;

const leadAgentImages: ImageTheme = {
  light: "/images/background-orange-light.webp",
  dark: "/images/background-orange-dark.webp",
}

const subAgentImages: Partial<Record<SubAgent, ImageTheme>> & { default: ImageTheme } = {
  general: {
    light: "/images/background-purple-light.webp",
    dark: "/images/background-purple-dark.webp",
  },
  contact: {
    light: "/images/background-green-light.webp",
    dark: "/images/background-green-dark.webp",
  },
  default: {
    light: "/images/background-purple-light.webp",
    dark: "/images/background-purple-dark.webp",
  },
}


function Icon({ icon, className, ...props }: HTMLAttributes<HTMLOrSVGElement> & { icon: AgentIcon }): React.ReactNode {
  const IconComponent = icons[icon];
  return <IconComponent className={className} {...props} />;
}
