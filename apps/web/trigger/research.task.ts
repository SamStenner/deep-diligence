import { logger, task } from "@trigger.dev/sdk/v3";
import { getProjectById, createProjectResearch, updateProjectStatus } from "@/lib/data/db";
import { modelMessagesToUiMessage } from "@/lib/ai-utils";
import { createLogger } from "@/lib/logger";
import {
  stepCountIs,
  StepResult,
  StopCondition,
  ToolLoopAgent,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools, type AgentTools, type AgentToolName, AgentUIMessage } from "@/lib/research/agents/orchestrator";

const researchTaskLog = createLogger("research-task");

const includesTool = (
  steps: Array<StepResult<AgentTools>>,
  tool: AgentToolName
) =>
  steps.some((step) =>
    step.staticToolCalls.some((call) => call.toolName === tool)
  );

const MAX_STEPS = process.env.NODE_ENV === "production" ? 300 : 15;

const model = anthropic("claude-sonnet-4-5");

type Output = Parameters<StopCondition<AgentTools>>[number];

const stopWhen = [
  (output: Output) => includesTool(output.steps, "done"),
  stepCountIs(MAX_STEPS),
];


// Schema for email reply events
export interface EmailReplyPayload {
  projectId: string;
  emailId: string;
  from: string;
  subject: string;
  content: string;
  receivedAt: string;
}

// Schema for phone call completion events
export interface PhoneCallPayload {
  projectId: string;
  conversationId: string;
  transcript: Array<{
    role: "agent" | "user";
    message: string;
    timeInCallSecs: number;
  }>;
  analysis: {
    callSuccessful: string;
    transcriptSummary: string;
    callSummaryTitle: string;
  };
  callDurationSecs: number;
  terminationReason: string;
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

    const prompt = `
The project is about the company ${project.companyName}.
The company is in the industry of ${project.industry}.
The company is located in ${project.headquarters}.
The company has ${project.employeeCount} employees.
The company's website is ${project.companyWebsite}.
The company's existing info is ${project.existingInfo}.
The company's key questions are ${project.keyQuestions}.
The company's timeline is ${project.timeline}.
The company's priority areas are ${project.priorityAreas?.join(", ")}.

The existing info is extremely important. If the user specifies existing info, you MUST use it or obey any specific instructions.
`.trim();

    researchTaskLog.info("Prompt", { prompt });

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

    // Mark project as completed
    await updateProjectStatus(projectId, "completed");

    logger.log("Research completed and saved", { projectId });
    researchTaskLog.info("Research completed and saved", { projectId });

    return { success: true, projectId };
  },
});