import type { ToolSet } from 'ai';
import z from 'zod';
import { subAgentRegistry } from '../sub.agents';
import type { AgentToolsMetadata, SubAgent, SubAgentToolNames } from '../types';

/**
 * Zod schema for validating sub-agent IDs.
 * Only includes enabled agents.
 */
export const subAgentSchema = z.union(
  Object.entries(subAgentRegistry)
    .filter(([, { disabled }]) => !disabled)
    .map(([id, { description }]) =>
      z.literal(id as SubAgent).describe(description)
    ) as [z.ZodLiteral<SubAgent>, ...z.ZodLiteral<SubAgent>[]]
);

/**
 * Extracts tool metadata from all registered sub-agents.
 * Used by the project creation wizard to display available tools.
 */
export function getAgentToolsMetadata(): AgentToolsMetadata[] {
  return Object.entries(subAgentRegistry).map(([id, entry]) => {
    const agent = entry.agent({ projectId: '' });
    return {
      id: id as SubAgent,
      name: entry.name,
      description: entry.description,
      icon: entry.icon,
      tools: Object.entries(agent.tools).map(([name, tool]) => ({
        name: (tool.title ?? name) as SubAgentToolNames,
        description: (tool as { description?: string }).description ?? '',
      })),
    };
  });
}

/**
 * Filters out disabled tools from a toolset
 */
export const disableTools = <T extends ToolSet>(
  tools: T,
  disabledTools: (keyof T)[]
) =>
  (Object.keys(tools) as (keyof T)[]).filter(
    (tool) => !disabledTools.includes(tool)
  );
