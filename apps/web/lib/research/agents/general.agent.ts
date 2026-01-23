import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { utilityTools, webTools } from "./tools";
import type { AgentContext } from "./types";
import { SubAgent } from "./utils/server";

const baseTools = {
  ...webTools,
  ...utilityTools,
};

export const generalAgent = (context: AgentContext, subagentId: string) =>
  new SubAgent({
    id: "general",
    subagentId,
    instructions:
      "You are a general agent. You are tasked with performing a task.",
    model: anthropic("claude-opus-4-5"),
    tools: baseTools,
    stopWhen: [stepCountIs(3)],
    experimental_context: context,
  });
