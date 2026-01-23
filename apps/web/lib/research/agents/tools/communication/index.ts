import { dynamicTool, tool } from "ai";
import { z } from "zod";
import type { AgentContext } from "../../types";
import { executePhoneCall } from "./phone-call";
import { executeSendEmail } from "./send-email";

export const communicationTools = {
  sendEmail: tool({
    title: "Send Email",
    description:
      "Send an email to the recipient and wait for their reply. This will send a real email and pause execution until a reply is received or timeout occurs (default 7 days).",
    inputSchema: z.object({
      to: z.email().describe("The email address to send to"),
      subject: z.string().describe("The email subject line"),
      body: z.string().describe("The email body content"),
      timeoutDays: z
        .number()
        .optional()
        .default(7)
        .describe("How many days to wait for a reply (default: 7)"),
    }),
    execute: async (input, { experimental_context: context }) => {
      const { projectId } = context as AgentContext;
      return executeSendEmail(input, projectId);
    },
  }),
  phoneCall: tool({
    title: "Phone Call",
    description: "Make a phone call to the recipient.",
    inputSchema: z.object({
      to: z
        .string()
        .describe(
          "The phone number to call. MUST be a US or UK phone number (+1 or +44).",
        ),
      prompt: z
        .string()
        .describe(
          "The prompt to use when calling the recipient. This will be used to determine if the recipient is real.",
        ),
      firstMessage: z
        .string()
        .describe("The first message to send to the recipient."),
      language: z
        .string()
        .describe(
          "The language to use when calling the recipient if not English (default: English)",
        )
        .optional(),
    }),
    execute: async (input, { experimental_context: context }) => {
        const { projectId } = context as AgentContext;
        return executePhoneCall(input, projectId);
      },
  }),
};

export type CommunicationTools = keyof typeof communicationTools;
