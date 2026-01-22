import type { InferUITools, ToolLoopAgent, ToolSet, UIDataTypes, UIMessage } from 'ai';
import type { SubAgentProperties } from '../agent.properties';
import type { subAgentRegistry } from '../sub.agents';
import type { Simplify, UnionToIntersection } from './utility.types';

/**
 * Context passed to all sub-agents
 */
export type AgentContext = { projectId: string };

/**
 * Input type for defining a sub-agent.
 * Used when registering new agents in the registry.
 */
export type AgentInput<TOOLS extends ToolSet = {}> = {
  properties: SubAgentProperties;
  agent: (context: AgentContext) => ToolLoopAgent<never, TOOLS>;
  disabled?: boolean;
};

/**
 * Full agent entry type with all properties spread.
 * This is what gets stored in the registry.
 */
export type AgentEntry<TOOLS extends ToolSet = {}, D extends boolean = false> = SubAgentProperties & {
  agent: (context: AgentContext) => ToolLoopAgent<never, TOOLS>;
  disabled: D;
};

/**
 * Union of all tools across all sub-agents
 */
export type SubAgentTools = Simplify<
  UnionToIntersection<
    ReturnType<(typeof subAgentRegistry)[keyof typeof subAgentRegistry]['agent']>['tools']
  >
>;

export type SubAgentUITools = InferUITools<SubAgentTools>;

let a: SubAgentUITools

export type SubAgentToolNames = keyof SubAgentTools;

export type SubAgentUIOutput = SubAgentUITools[keyof SubAgentUITools]['output'];

export type SubAgentUIMessage = UIMessage<unknown, UIDataTypes, SubAgentUITools>;

/**
 * Extracts only the keys where disabled is not true
 */
type EnabledSubAgentKeys = {
  [K in keyof typeof subAgentRegistry]: (typeof subAgentRegistry)[K]['disabled'] extends true
    ? never
    : K;
}[keyof typeof subAgentRegistry];

export type SubAgent = EnabledSubAgentKeys;

/**
 * Use this when you need all agent keys regardless of disabled status
 */
export type AllSubAgent = keyof typeof subAgentRegistry;

/**
 * Tool metadata type for UI display
 */
export type ToolMetadata = {
  name: SubAgentToolNames;
  description: string;
};

export type AgentToolsMetadata = {
  id: SubAgent;
  name: string;
  description: string;
  icon: SubAgentProperties['icon'];
  tools: ToolMetadata[];
};
