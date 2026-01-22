import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { utilityTools, webTools } from "./tools";
import { AgentContext } from "./types";

const baseTools = {
  ...webTools,
  ...utilityTools,
};

export const generalAgent = (context: AgentContext) => new ToolLoopAgent({
  id: "general",
  instructions: "You are a general agent. You are tasked with performing a task.",
  model: anthropic("claude-opus-4-5"),
  tools: baseTools,
  stopWhen: [stepCountIs(3)],
  experimental_context: context
});

