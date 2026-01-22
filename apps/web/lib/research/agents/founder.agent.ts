import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { communicationTools } from "./tools/communication";
import { webTools } from "./tools/web.tools";
import { AgentContext } from "./types";

const founderTools = {
  ...webTools,
};

export const founderAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "founder",
  instructions,
  model: anthropic("claude-sonnet-4-5"),
  tools: founderTools,
  stopWhen: stepCountIs(5),
  experimental_context: context
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