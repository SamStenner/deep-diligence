"use client";

import * as React from "react";
import * as icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { type AgentToolsMetadata } from "@/lib/research/agents/sub.agents";

export function AgentConfigCard({ agent }: { agent: AgentToolsMetadata }) {
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  const AgentIcon = icons[agent.icon] ?? icons.Bot;

  const handleAgentToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isEnabled) {
      setIsOpen(open);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <div
        className={cn(
          "rounded-xl border overflow-hidden transition-all duration-200",
          isEnabled ? "bg-card" : "bg-muted/30 border-border/50"
        )}
      >
        {/* Header */}
        <CollapsibleTrigger
          className={cn(
            "flex items-center gap-3 p-4 w-full text-left transition-colors",
            isEnabled ? "hover:bg-accent/50 cursor-pointer" : "cursor-default"
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              isEnabled ? "bg-primary/10" : "bg-muted"
            )}
          >
            <AgentIcon
              className={cn(
                "size-5",
                isEnabled ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          <div className={cn("flex-1 min-w-0", !isEnabled && "opacity-60")}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-medium",
                  !isEnabled && "text-muted-foreground"
                )}
              >
                {agent.name}
              </span>
              <Badge
                variant="secondary"
                className={cn("text-xs", !isEnabled && "opacity-50")}
              >
                {agent.tools.length} tools
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>

          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
              !isEnabled && "opacity-50"
            )}
          />

          <Switch
            checked={isEnabled}
            onCheckedChange={handleAgentToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${isEnabled ? "Disable" : "Enable"} ${agent.name}`}
          />
        </CollapsibleTrigger>

        {/* Tools List */}
        <CollapsibleContent>
          <div className="border-t bg-muted/30">
            <div className="p-3 grid gap-2 sm:grid-cols-2">
              {agent.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{tool.name}</p>
                    {tool.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function AgentConfigList({ agents }: { agents: AgentToolsMetadata[] }) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentConfigCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
