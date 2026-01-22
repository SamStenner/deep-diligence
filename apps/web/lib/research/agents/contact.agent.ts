import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import {  } from "./sub.agents";
import { communicationTools } from "./tools/communication";
import { webTools } from "./tools/web.tools";
import { AgentContext } from "./types";

const contactTools = {
  ...webTools,
  ...communicationTools,
};

export const contactAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "contact",
  instructions,
  model: anthropic("claude-sonnet-4-5"),
  tools: contactTools,
  stopWhen: stepCountIs(5),
  experimental_context: context
});


const instructions = `
You are a contact analyst. You are tasked with contacting the company to check if they are real. 
You should first try using the searchWeb tool to find contact information. If that doesn't work, use the browseWeb tool next.
You should then use either/both the sendEmail and phoneCall tools to contact the recipient.
You just need to verify some basic information about the company to confirm they are real. Don't do a deep dive investigation.
`;