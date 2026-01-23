import type {
  InferUITools,
  ToolLoopAgent,
  ToolSet,
  UIDataTypes,
  UIMessage,
} from "ai";
import { Subagent } from "@/lib/data/schema";
import type { SubAgentProperties } from "../agent.properties";
import type { subAgentRegistry } from "../sub.agents";
import type { Simplify, UnionToIntersection } from "./utility.types";

/**
 * Context passed to all sub-agents
 */
export type AgentContext = { projectId: string; researchId: string };

/**
 * Input type for defining a sub-agent.
 * Used when registering new agents in the registry.
 */
export type AgentInput<TOOLS extends ToolSet = {}> = {
  properties: SubAgentProperties;
  agent: (context: AgentContext, subagentId: string) => ToolLoopAgent<never, TOOLS>;
};

/**
 * Full agent entry type with all properties spread.
 * This is what gets stored in the registry.
 */
export type AgentEntry<TOOLS extends ToolSet = {}> = SubAgentProperties & {
  agent: (context: AgentContext, subagentId: string) => ToolLoopAgent<never, TOOLS>;
};

/**
 * Union of all tools across all sub-agents
 */
export type SubAgentTools = Simplify<
  UnionToIntersection<
    ReturnType<
      (typeof subAgentRegistry)[keyof typeof subAgentRegistry]["agent"]
    >["tools"]
  >
>;

export type SubAgentUITools = InferUITools<SubAgentTools>;

export type SubAgentToolNames = keyof SubAgentTools;

export type SubAgentUIOutput = SubAgentUITools[keyof SubAgentUITools]["output"];

export type SubAgentMetadata = { name: SubAgentName };

export type SubAgentUIMessage = UIMessage<
  SubAgentMetadata,
  UIDataTypes,
  SubAgentUITools
> & { metadata: SubAgentMetadata };

/**
 * Use this when you need all agent keys regardless of disabled status
 */
export type SubAgentName = keyof typeof subAgentRegistry;

/**
 * Tool metadata type for UI display
 */
export type ToolMetadata = {
  name: SubAgentToolNames;
  description: string;
};

export type AgentToolsMetadata = {
  id: SubAgentName;
  name: string;
  description: string;
  icon: SubAgentProperties["icon"];
  tools: ToolMetadata[];
  disabled: boolean
};
