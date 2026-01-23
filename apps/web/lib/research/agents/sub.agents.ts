import { ToolSet } from "ai";
import { subAgentPropertiesRegistry } from "./agent.properties";
import { contactAgent } from "./contact.agent";
import { corporateAgent } from "./corporate.agent";
import { founderAgent } from "./founder.agent";
import { generalAgent } from "./general.agent";
import type { AgentContext, AgentEntry, AgentInput } from "./types";

export const defineAgent = <TOOLS extends ToolSet>({agent, properties}: AgentInput<TOOLS>): AgentEntry<TOOLS> => ({
  ...properties,
  agent,
});


export const subAgentRegistry = {
  general: defineAgent({
    properties: subAgentPropertiesRegistry.general,
    agent: (context: AgentContext, subagentId: string) => generalAgent(context, subagentId),
  }),
  contact: defineAgent({
    properties: subAgentPropertiesRegistry.contact,
    agent: (context: AgentContext, subagentId: string) => contactAgent(context, subagentId),
  }),
  corporate: defineAgent({
    properties: subAgentPropertiesRegistry.corporate,
    agent: (context: AgentContext, subagentId: string) => corporateAgent(context, subagentId),
  }),
  founder: defineAgent({
    properties: subAgentPropertiesRegistry.founder,
    agent: (context: AgentContext, subagentId: string) => founderAgent(context, subagentId),
  }),
};
