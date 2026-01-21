import {
  GenerateTextResult,
  InferToolOutput,
  InferUITools,
  tool,
  UIDataTypes,
  UIMessage,
} from "ai";
import { z } from "zod";
import { subAgentRegistry, subAgentSchema, SubAgentUIMessage, SubAgentUITools } from "../sub.agents";
import {} from "ai";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";

const store = { plan: "" };

export const tools = {
  updatePlan: tool({
    description:
      "Update the plan for the task. This is a markdown file that will use to write your plan. The plan should be continuously checked and updated.",
    inputSchema: z.object({
      plan: z.string().describe("The plan for the task"),
    }),
    execute: async ({ plan }) => {
      store.plan = plan;
    },
  }),
  checkPlan: tool({
    description: "Check the plan for the task",
    inputSchema: z.object(),
    execute: async () => store.plan,
  }),
  spawnAgent: tool({
    description: "Spawn a new agent to perform a task",
    inputSchema: z.object({
      subAgents: z.array(
        z.object({
          subAgent: subAgentSchema,
          prompt: z.string(),
        }),
      ),
    }),
    execute: async ({ subAgents }) =>
      Promise.all(
        subAgents.map(async ({ subAgent, prompt }) => {
          const { agent } = subAgentRegistry[subAgent];
          const output = await agent.generate({ prompt });
          return modelMessagesToUiMessage<SubAgentUIMessage>(output.response.messages, output.response.id);
        }),
      ),
  }),
  done: tool({
    description:
      "Mark a task as done. This can ONLY be called if the plan is completed and all tasks have been marked as completed in the plan.",
    inputSchema: z.object({
      report: z.string().optional().describe("The report of the task. This is a markdown file that will use to write your report. This should be a comprehensive report based on the findings of the sub-agents."),
    })
  }),
};

type Tools = typeof tools;


export type ToolsContext = {
  projectId: string;
};
