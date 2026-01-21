import type { icons } from "lucide-react";

export type AgentIcon = keyof typeof icons;

export type SubAgentPropertiesInput = {
  name: string;
  description: string;
  icon: AgentIcon;
}

const defineSubAgentProperties = (agent: SubAgentPropertiesInput) => agent

export const subAgentPropertiesRegistry = {
  general: defineSubAgentProperties({
    name: "General Analyst",
    description: "For general-purpose research and information gathering",
    icon: "Bot",
  }),
  contact: defineSubAgentProperties({
    name: "Contact Analyst",
    description: "For contacting the company to check if they are real",
    icon: "User",
  }),
}

export type SubAgentProperties = (typeof subAgentPropertiesRegistry)[keyof typeof subAgentPropertiesRegistry]