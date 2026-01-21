import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { getProjectById, createProjectResearch } from "@/lib/data/db";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";
import { createLogger } from "@/lib/logger";
import {
  stepCountIs,
  StepResult,
  StopCondition,
  ToolLoopAgent,
  UIMessage,
  UIDataTypes,
  InferUITools,
  wrapLanguageModel,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools } from "@/lib/research/agents/orchestrator";

const researchTaskLog = createLogger("research-task");

type AgentTools = typeof tools;

const includesTool = (
  steps: Array<StepResult<AgentTools>>,
  tool: keyof AgentTools
) =>
  steps.some((step) =>
    step.staticToolCalls.some((call) => call.toolName === tool)
  );

const MAX_STEPS = process.env.NODE_ENV === "production" ? 300 : 15;

const model = anthropic("claude-haiku-4-5");

type Output = Parameters<StopCondition<AgentTools>>[number];

const stopWhen = [
  (output: Output) => includesTool(output.steps, "done"),
  stepCountIs(MAX_STEPS),
];

type AgentUITools = InferUITools<AgentTools>;
type AgentUIMessage = UIMessage<unknown, UIDataTypes, AgentUITools>;

// Schema for email reply events
export interface EmailReplyPayload {
  projectId: string;
  emailId: string;
  from: string;
  subject: string;
  content: string;
  receivedAt: string;
}

/**
 * Main research task that runs the orchestrator agent.
 * This task is durable and can wait for external events like email replies.
 */
export const researchTask = task({
  id: "research-run",
  maxDuration: 3600, // 1 hour max
  run: async ({ projectId }: { projectId: string }) => {
    logger.log("Starting research task", { projectId });
    researchTaskLog.info("Starting research task", { projectId });

    const project = await getProjectById(projectId);
    if (!project) {
      researchTaskLog.error("Project not found", { projectId });
      throw new Error(`Project not found: ${projectId}`);
    }

    researchTaskLog.info("Project loaded", {
      companyName: project.companyName,
      industry: project.industry,
    });

    const prompt = `The project is about the company ${project.companyName}. The company is in the industry of ${project.industry}. The company is located in ${project.headquarters}. The company has ${project.employeeCount} employees.`;

    const createAgent = () => {
      const context = { projectId };
      return new ToolLoopAgent({
        instructions:
          "You are a research agent. You are tasked with researching the project and providing a report. You MUST create a plan before spawning agents. Once the agents are completed, you need to update your plan. You may need to call agents multiple times to complete the plan. Once your plan is completed, you will need to mark the task as done. You MUST call the done tool before stopping.",
        toolChoice: "required",
        model,
        tools,
        stopWhen,
        experimental_context: context,
      });
    };

    researchTaskLog.info("Creating orchestrator agent");
    const agent = createAgent();

    researchTaskLog.info("Starting agent generation");
    const output = await agent.generate({ prompt });

    researchTaskLog.info("Agent generation complete", {
      messageCount: output.response.messages.length,
    });

    const result = modelMessagesToUiMessage<AgentUIMessage>(
      output.response.messages,
      output.response.id
    );

    // Save research results
    await createProjectResearch(projectId, result);

    logger.log("Research completed and saved", { projectId });
    researchTaskLog.info("Research completed and saved", { projectId });

    return { success: true, projectId };
  },
});

/**
 * Create a waitpoint token for an email reply.
 * This should be called when sending an email to set up the wait.
 * Returns the token ID that should be stored with the email conversation.
 */
export async function createEmailWaitToken(
  emailId: string,
  timeoutDays: number = 7
): Promise<string> {
  const token = await wait.createToken({
    timeout: `${timeoutDays}d`,
    tags: [`email:${emailId}`],
    idempotencyKey: `email-reply-${emailId}`,
    idempotencyKeyTTL: `${timeoutDays + 1}d`,
  });

  logger.log("Created email wait token", { emailId, tokenId: token.id });
  return token.id;
}

/**
 * Wait for an email reply using an existing wait token.
 * The token should have been created when the email was sent.
 */
export async function waitForEmailReplyToken(
  tokenId: string
): Promise<EmailReplyPayload | null> {
  logger.log("Waiting for email reply", { tokenId });

  const result = await wait.forToken<EmailReplyPayload>({ id: tokenId });

  if (!result.ok) {
    logger.warn("Email reply timeout", { tokenId });
    return null;
  }

  logger.log("Email reply received", { tokenId });
  return result.output;
}
