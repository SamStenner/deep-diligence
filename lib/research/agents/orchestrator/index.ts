import {
  tool,
} from "ai";
import { z } from "zod";
import { subAgentRegistry, subAgentSchema, SubAgentUIMessage } from "../sub.agents";
import {} from "ai";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";
import { createLogger } from "@/lib/logger";
import { AgentContext } from "../sub.agents";

const orchestratorLog = createLogger("orchestrator");

const store = { plan: "" };

export const tools = {
  updatePlan: tool({
    description:
      "Update the plan for the task. This is a markdown file that will use to write your plan. The plan should be continuously checked and updated.",
    inputSchema: z.object({
      plan: z.string().describe("The plan for the task"),
    }),
    execute: async ({ plan }) => {
      orchestratorLog.tool("updatePlan", { planLength: plan.length });
      store.plan = plan;
      orchestratorLog.info("Plan updated");
    },
  }),
  checkPlan: tool({
    description: "Check the plan for the task",
    inputSchema: z.object(),
    execute: async () => {
      orchestratorLog.tool("checkPlan", {});
      return store.plan;
    },
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
    execute: async ({ subAgents }, { experimental_context: context }) => {
      orchestratorLog.tool("spawnAgent", {
        agentCount: subAgents.length,
        agents: subAgents.map((a) => a.subAgent),
      });
      const agentContext = context as AgentContext;
      const results = await Promise.all(
        subAgents.map(async ({ subAgent, prompt }) => {
          orchestratorLog.info(`Spawning sub-agent: ${subAgent}`, { prompt: prompt.slice(0, 100) });
          const { agent } = subAgentRegistry[subAgent];
          const output = await agent(agentContext).generate({ prompt  });
          orchestratorLog.info(`Sub-agent completed: ${subAgent}`, {
            messageCount: output.response.messages.length,
          });
          return modelMessagesToUiMessage<SubAgentUIMessage>(output.response.messages, output.response.id);
        }),
      );

      orchestratorLog.toolResult("spawnAgent", { resultCount: results.length });
      return results;
    },
  }),
  done: tool({
    description:
      "Mark a task as done. This can ONLY be called if the plan is completed and all tasks have been marked as completed in the plan.",
    inputSchema: z.object({
      report: z.string().optional().describe("The report of the task. This is a markdown file that will use to write your report. This should be a comprehensive report based on the findings of the sub-agents."),
    }),
    execute: async ({ report }) => {
      orchestratorLog.tool("done", { hasReport: !!report });
      orchestratorLog.info("Task marked as done");
    },
  }),
};

type Tools = typeof tools;


export type ToolsContext = {
  projectId: string;
};
