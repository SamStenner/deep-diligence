import type { icons } from 'lucide-react';

export type AgentIcon = keyof typeof icons;

export type SubAgentProperties = {
  name: string;
  description: string;
  icon: AgentIcon;
};

const defineAgentProperties = <T extends SubAgentProperties>(agent: T) => agent;

export const subAgentPropertiesRegistry = {
  general: defineAgentProperties({
    name: 'General Analyst',
    description: 'For general-purpose research and information gathering',
    icon: 'Bot',
  }),
  contact: defineAgentProperties({
    name: 'Contact Analyst',
    description: 'For contacting the company to check if they are real',
    icon: 'User',
  }),
  corporate: defineAgentProperties({
    name: 'Corporate Analyst',
    description: 'For analyzing the corporate structure of the company',
    icon: 'Building',
  }),
  founder: defineAgentProperties({
    name: 'Founder Analyst',
    description: 'For analyzing the background of the founder of the company',
    icon: 'User',
  }),
}
