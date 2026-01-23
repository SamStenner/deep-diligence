import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent, ToolLoopAgentSettings, ToolSet, Output, StepResult } from 'ai';
import { communicationTools } from "./tools/communication";
import { webTools } from "./tools/web.tools";
import type { AgentContext } from "./types";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";
import { SubAgent } from './utils/server';

const founderTools = {
  ...webTools,
};

export const founderAgent = (context: AgentContext, subagentId: string) =>
  new SubAgent({
    id: "founder",
    subagentId,
    instructions,
    model: anthropic("claude-sonnet-4-5"),
    tools: founderTools,
    stopWhen: stepCountIs(5),
    experimental_context: context,
  });

const instructions = `
You are a founder background checker. You are tasked with checking the background of the founder of the company and building a timeline of their life.
This should include the founder's personal life, family history, education, positive achievements, negative stories, work history, and any other relevant information.
You might also want to check, but not limited to:
  - LinkedIn profile
  - News articles
  - Books
  - Blogs
  - Podcasts
  - GitHub profiles
  - Twitter/X profiles
`;
