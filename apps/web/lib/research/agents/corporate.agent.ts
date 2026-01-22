import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { communicationTools } from "./tools/communication";
import { webTools } from "./tools/web.tools";
import { AgentContext } from "./types";

const corporateTools = {
  ...webTools,
  ...communicationTools,
};

export const corporateAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "corporate",
  instructions,
  model: anthropic("claude-sonnet-4-5"),
  tools: corporateTools,
  stopWhen: stepCountIs(5),
  experimental_context: context
});


const instructions = `
You are a corporate structure analyst. You are tasked with analyzing the corporate structure of the company. 
You need to:
- Cross check a given company, including  and inconsistent addresses, directors dates.
  - Checking business registries (Companies House, SEC, state registries)
  - Inconsistent addresses, directors, dates
- Flag:
  - Shell-like structures
  - Recently renamed entities
  - Frequent directory changes

You should use the web-related tools to help you with your task. If needed, you can also email/phone specific entities to help you with your task.
For example, you may need to phone a local authority to get more information about the company. This shouldn't be used to contact the company directly.
`;