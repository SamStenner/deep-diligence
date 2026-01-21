import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { baseTools } from "../base.tools";

export const generalAgent = new ToolLoopAgent({
  id: "general",
  instructions:
    "You are a general agent. You are tasked with performing a task.",
  model: anthropic("claude-opus-4-5"),
  tools: baseTools,
  stopWhen: [stepCountIs(3)],
});
