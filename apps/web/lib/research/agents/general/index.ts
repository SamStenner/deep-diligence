import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, Tool, ToolLoopAgent, ToolSet } from "ai";
import { BaseTools, baseTools } from "../base.tools";
import { disableTools, AgentContext } from "../sub.agents";

export const generalAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "general",
  instructions:
    "You are a general agent. You are tasked with performing a task.",
  model: anthropic("claude-opus-4-5"),
  tools: baseTools,
  activeTools: disableTools(baseTools, ["browseWeb"]),
  stopWhen: [stepCountIs(3)],
  experimental_context: context
});

