import { InferUITools, ToolLoopAgent, ToolSet, UIDataTypes, UIMessage } from 'ai';
import { generalAgent } from "./general";
import z from "zod";
import { contactAgent } from './contact';
import { SubAgentProperties, subAgentPropertiesRegistry } from './agent.properties';

export type AgentInput<TOOLS extends ToolSet = {}> = {
  properties: SubAgentProperties;
  agent: (context: AgentContext) => ToolLoopAgent<never, TOOLS>;
  disabled?: boolean
}

const defineSubAgent = <TOOLS extends ToolSet, const D extends boolean = false>({ 
  agent, 
  properties, 
  disabled = false as D 
}: Omit<AgentInput<TOOLS>, 'disabled'> & { disabled?: D }) => ({
  ...properties,
  agent,
  disabled
})

export const subAgentRegistry = {
  general: defineSubAgent({
    properties: subAgentPropertiesRegistry.general,
    agent: generalAgent,
  }),
  contact: defineSubAgent({
    properties: subAgentPropertiesRegistry.contact,
    agent: contactAgent,
    disabled: true,
  })
};

export type AgentContext = { projectId: string };

export type SubAgentTools = Simplify<UnionToIntersection<ReturnType<(typeof subAgentRegistry[keyof typeof subAgentRegistry])["agent"]>["tools"]>>

export type SubAgentUITools = InferUITools<SubAgentTools>;

export type SubAgentToolNames = keyof SubAgentTools;

export type SubAgentUIOutput = SubAgentUITools[keyof SubAgentUITools]["output"]

export type SubAgentUIMessage = UIMessage<unknown, UIDataTypes, SubAgentUITools>;

// Extracts only the keys where disabled is not true
type EnabledSubAgentKeys = {
  [K in keyof typeof subAgentRegistry]: (typeof subAgentRegistry)[K]['disabled'] extends true ? never : K
}[keyof typeof subAgentRegistry];

export type SubAgent = EnabledSubAgentKeys;

// Use this when you need all agent keys regardless of disabled status
export type AllSubAgent = keyof typeof subAgentRegistry;

export const subAgentSchema = z.union(
  Object.entries(subAgentRegistry)
    .filter(([, { disabled }]) => !disabled)
    .map(([id, { description }]) =>
      z.literal(id as SubAgent).describe(description),
    ) as [z.ZodLiteral<SubAgent>, ...z.ZodLiteral<SubAgent>[]],
);

type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void
    ? I
    : never;

type Simplify<T> = { [K in keyof T]: T[K] };


// Tool metadata type for UI display
export type ToolMetadata = {
  name: SubAgentToolNames;
  description: string;
};

export type AgentToolsMetadata = {
  id: SubAgent;
  name: string;
  description: string;
  icon: SubAgentProperties["icon"];
  tools: ToolMetadata[];
};

/**
 * Extracts tool metadata from all registered sub-agents.
 * Used by the project creation wizard to display available tools.
 */
export function getAgentToolsMetadata(): AgentToolsMetadata[] {
  return Object.entries(subAgentRegistry).map(([id, entry]) => {
    const agent = entry.agent({ projectId: "" });
    return {
      id: id as SubAgent,
      name: entry.name,
      description: entry.description,
      icon: entry.icon,
      tools: Object.entries(agent.tools).map(([name, tool]) => ({
        name: tool.title ?? name as SubAgentToolNames,
        description: (tool as { description?: string }).description ?? "",
      })),
    };
  });
}

export const disableTools = <T extends ToolSet>(tools: T, disabledTools: (keyof T)[]) => (Object.keys(tools) as (keyof T)[]).filter(tool => !disabledTools.includes(tool));