import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent } from "ai";
import { baseTools } from "../base.tools";
import { contactTools } from "./tools";

export const contactAgent = new ToolLoopAgent({
  id: "contact",
  instructions:
    "You are a contact analyst. You are tasked with contacting the company to check if they are real.",
  model: anthropic("claude-haiku-4-5"),
  tools: contactTools,
  stopWhen: stepCountIs(5),
});
