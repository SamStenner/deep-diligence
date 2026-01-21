import { InferUITools, ToolLoopAgent, ToolSet, UIDataTypes, UIMessage } from 'ai';
import { generalAgent } from "./general";
import z from "zod";
import { contactAgent } from './contact';
import { SubAgentProperties, subAgentPropertiesRegistry } from './agent.properties';

export type AgentInput<TOOLS extends ToolSet = {}> = {
  properties: SubAgentProperties;
  agent: (context: AgentContext) => ToolLoopAgent<never, TOOLS>;
}

const defineSubAgent = <TOOLS extends ToolSet>({ agent, properties }: AgentInput<TOOLS>) => ({
  ...properties,
  agent
})

export const subAgentRegistry = {
  general: defineSubAgent({
    properties: subAgentPropertiesRegistry.general,
    agent: (context: AgentContext) => generalAgent(context)
  }),
  contact: defineSubAgent({
    properties: subAgentPropertiesRegistry.contact,
    agent: (context: AgentContext) => contactAgent(context)
  })
};

export type AgentContext = { projectId: string };

export type SubAgentTools = Simplify<UnionToIntersection<ReturnType<(typeof subAgentRegistry[keyof typeof subAgentRegistry])["agent"]>["tools"]>>

export type SubAgentUITools = InferUITools<SubAgentTools>;

export type SubAgentToolNames = keyof SubAgentTools;

export type SubAgentUIOutput = SubAgentUITools[keyof SubAgentUITools]["output"]

export type SubAgentUIMessage = UIMessage<unknown, UIDataTypes, SubAgentUITools>;

export type SubAgent = keyof typeof subAgentRegistry;

export const subAgentSchema = z.union(
  Object.entries(subAgentRegistry).map(([id, { description }]) =>
    z.literal(id as SubAgent).describe(description),
  ) as [z.ZodLiteral<SubAgent>, ...z.ZodLiteral<SubAgent>[]],
);

type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void
    ? I
    : never;

type Simplify<T> = { [K in keyof T]: T[K] };
