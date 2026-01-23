import { StepResult, ToolLoopAgent, type ToolLoopAgentSettings, type ToolSet } from "ai";
import { z } from "zod";
import { subAgentRegistry } from "../sub.agents";
import type {
  AgentContext,
  AgentToolsMetadata,
  SubAgentName,
  SubAgentToolNames,
  SubAgentUIMessage,
} from "../types";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";
import { createSubagentMessage } from "@/lib/data/db";

export class SubAgent<CallOptions = never, TOOLS extends ToolSet = {}> extends ToolLoopAgent<CallOptions, TOOLS>   {
  constructor(props: ToolLoopAgentSettings<CallOptions, TOOLS> & { subagentId: string, experimental_context: AgentContext }) {
    const onStepFinish = async (step: StepResult<TOOLS>) => {
      props.onStepFinish?.(step);
      const message = modelMessagesToUiMessage<SubAgentUIMessage>(step.response.messages, step.response.id);
      await createSubagentMessage(props.subagentId, message);
    }
    super({
      ...props,
      onStepFinish
    });
  }
}


/**
 * Zod schema for validating sub-agent IDs.
 * Only includes enabled agents.
 */
export const subAgentSchema = z.union(
  Object.entries(subAgentRegistry)
    .filter(([, { disabled }]) => !disabled)
    .map(([id, { description }]) =>
      z.literal(id as SubAgentName).describe(description),
    ) as [z.ZodLiteral<SubAgentName>, ...z.ZodLiteral<SubAgentName>[]],
);

/**
 * Extracts tool metadata from all registered sub-agents.
 * Used by the project creation wizard to display available tools.
 */
export function getAgentToolsMetadata(): AgentToolsMetadata[] {
  return Object.entries(subAgentRegistry).map(([id, entry]) => {
    const props = subAgentRegistry[id as SubAgentName];
    const agent = entry.agent({ projectId: "", researchId: "" });
    return {
      id: id as SubAgentName,
      name: props.name,
      description: props.description,
      icon: props.icon,
      disabled: props.disabled ?? false,
      tools: Object.entries(agent.tools).map(([name, tool]) => ({
        name: (tool.title ?? name) as SubAgentToolNames,
        description: (tool as { description?: string }).description ?? "",
      })),
    };
  });
}
