import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { ContactTools, contactTools } from "./tools";
import { disableTools, AgentContext } from "../sub.agents";

export const contactAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "contact",
  instructions:
    "You are a contact analyst. You are tasked with contacting the company to check if they are real. You should first try using the searchWeb tool to find contact information. If that doesn't work, use the browseWeb tool next.",
  model: anthropic("claude-haiku-4-5"),
  tools: contactTools,
  stopWhen: stepCountIs(5),
  experimental_context: context
});
