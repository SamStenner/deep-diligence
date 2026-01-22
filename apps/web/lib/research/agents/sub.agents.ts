import type { ToolSet } from 'ai';
import { subAgentPropertiesRegistry, type SubAgentProperties } from './agent.properties';
import { generalAgent } from './general.agent';
import { contactAgent } from './contact.agent';
import { corporateAgent } from './corporate.agent';
import type { AgentContext, AgentEntry, AgentInput, AgentToolsMetadata, SubAgent, SubAgentToolNames } from './types';
import { founderAgent } from './founder.agent';
import { z } from 'zod';

const defineAgent = <TOOLS extends ToolSet, const Disabled extends boolean = false>({
  agent,
  properties,
  disabled = false as Disabled,
}: Omit<AgentInput<TOOLS>, 'disabled'> & { disabled?: Disabled }): AgentEntry<TOOLS, Disabled> => ({
  ...properties,
  agent,
  disabled,
});

export const subAgentRegistry = {
  general: defineAgent({
    properties: subAgentPropertiesRegistry.general,
    agent: (context: AgentContext) => generalAgent(context),
  }),
  contact: defineAgent({
    properties: subAgentPropertiesRegistry.contact,
    agent: (context: AgentContext) => contactAgent(context),
  }),
  corporate: defineAgent({
    properties: subAgentPropertiesRegistry.corporate,
    agent: (context: AgentContext) => corporateAgent(context),
  }),
  founder: defineAgent({
    properties: subAgentPropertiesRegistry.founder,
    agent: (context: AgentContext) => founderAgent(context),
  }),
};

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