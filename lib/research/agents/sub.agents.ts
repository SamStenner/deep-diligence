import { InferUITools, ToolLoopAgent, ToolSet, UIDataTypes, UIMessage } from 'ai';
import { generalAgent } from "./general";
import z from "zod";
import { type icons } from 'lucide-react';
import { contactAgent } from './contact';
import { contactTools } from './contact/tools';
import { baseTools } from './base.tools';

export type AgentInput<TOOLS extends ToolSet = {}> = {
  name: string;
  description: string;
  icon: keyof typeof icons;
  agent: ToolLoopAgent<never, TOOLS>;
}

const defineSubAgent = <TOOLS extends ToolSet>(agent: AgentInput<TOOLS>) => agent

export const subAgentRegistry = {
  general: defineSubAgent({
    name: "General Analyst",
    description: "For general-purpose research and information gathering",
    icon: "Bot",
    agent: generalAgent
  }),
  contact: defineSubAgent({
    name: "Contact Analyst",
    description: "For contacting the company to check if they are real",
    icon: "User",
    agent: contactAgent
  })
};

export type SubAgentTools = Simplify<UnionToIntersection<(typeof subAgentRegistry[keyof typeof subAgentRegistry])["agent"]["tools"]>>

export type SubAgentUITools = InferUITools<SubAgentTools>;

export type SubAgentUIOutput = SubAgentUITools[keyof SubAgentUITools]["output"]

export type SubAgentUIMessage = UIMessage<unknown, UIDataTypes, SubAgentUITools>;

export type SubAgent = keyof typeof subAgentRegistry;

export const subAgentSchema = z.union(
  Object.entries(subAgentRegistry).map(([id, { description }]) =>
    z.literal(id as SubAgent).describe(description),
  ) as [z.ZodLiteral<SubAgent>, ...z.ZodLiteral<SubAgent>[]],
);


const test = {
  general: {
    name: "General Analyst",
    description: "For general-purpose research and information gathering",
    icon: "Bot",
    tools: {
        example1: "hello",
        example2: "bye", 
    }
  },
  contact: {
    name: "Contact Analyst",
    description: "For contacting the company to check if they are real",
    icon: "User",
    tools: {
        example3: "start",
        example4: "stop", 
    }
  }
};

type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void
    ? I
    : never;

type Simplify<T> = { [K in keyof T]: T[K] };
