import {
  generateText,
  InferUITools,
  Output,
  stepCountIs,
  StepResult,
  StopCondition,
  ToolLoopAgent,
  UIDataTypes,
  UIMessage,
  wrapLanguageModel,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools } from "./agents/orchestrator";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { getProjectById } from "../data/db";
import { modelMessagesToUiMessage } from "../ai-utils";

type AgentTools = typeof tools;

const includesTool = (steps: Array<StepResult<AgentTools>>, tool: keyof AgentTools) =>
  steps.some((step) =>
    step.staticToolCalls.some((call) => call.toolName === tool),
  );

const MAX_STEPS = process.env.NODE_ENV === "production" ? 300 : 15;

const middleware = process.env.NODE_ENV === "development" ? devToolsMiddleware() : [];

const model = wrapLanguageModel({
  model: anthropic("claude-haiku-4-5"),
  middleware,
});

type Output = Parameters<StopCondition<AgentTools>>[number];

const stopWhen = [
  (output: Output) => includesTool(output.steps, "done"),
  stepCountIs(MAX_STEPS),
];

const createAgent = (projectId: string) => {
    const context = { projectId };
    return new ToolLoopAgent({
      instructions: "You are a research agent. You are tasked with researching the project and providing a report. You MUST create a plan before spawning agents. Once the agents are completed, you need to update your plan. You may need to call agents multiple times to complete the plan. Once your plan is completed, you will need to mark the task as done. You MUST call the done tool before stopping.",
      toolChoice: "required",
      model,
      tools,
      stopWhen,
      experimental_context: context,
    });
  };

export const generate = async (projectId: string) => {
  const project = await getProjectById(projectId);
  if (!project) throw new Error("Project not found");
  const prompt = `The project is about the company ${project.companyName}. The company is in the industry of ${project.industry}. The company is located in ${project.headquarters}. The company has ${project.employeeCount} employees.`;
  const agent = createAgent(projectId);
  const output = await agent.generate({ prompt });
  return modelMessagesToUiMessage<AgentUIMessage>(output.response.messages, output.response.id);
};

type AgentUITools = InferUITools<AgentTools>;
type AgentUIMessage = UIMessage<unknown, UIDataTypes, AgentUITools>;