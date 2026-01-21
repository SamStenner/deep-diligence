import { tool } from "ai";
import z from "zod";
import { browserUseClient } from "../clients/browser-use";


export const baseTools = {
  browseWeb: tool({
    description:
      "Browses the web for information. Provides a full visual browser experience, navigating through the web and providing a full context of the page.",
    inputSchema: z.object({
      website: z.string(),
      prompt: z.string().describe("The task to perform on the web."),
    }),
    execute: async ({ prompt }) => {
      const task = await browserUseClient.tasks.createTask({
        task: prompt,
      });
      const { judgeVerdict: success, judgement, output } = await task.complete();
      return { success, judgement, output };
    },
  }),

  getCurrentDateTime: tool({
    description:
      "Gets the current date and time. Useful for understanding temporal context when researching time-sensitive information.",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
      return {
        iso: now.toISOString(),
        date: now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: now.toLocaleTimeString("en-US"),
        timestamp: now.getTime(),
      };
    },
  }),

  calculate: tool({
    description:
      "Performs mathematical calculations. Useful for financial analysis, growth rates, ratios, and other numerical computations.",
    inputSchema: z.object({
      expression: z
        .string()
        .describe("A mathematical expression to evaluate (e.g., '(100 - 80) / 80 * 100')"),
    }),
    execute: async ({ expression }) => {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      if (sanitized !== expression.replace(/\s/g, "").replace(/\s/g, "")) throw new Error("Expression contains invalid characters");
      const result = new Function(`return (${sanitized})`)();
      if (typeof result !== "number" || !isFinite(result)) throw new Error("Result is not a valid number");
      return result
    },
  }),
  delay: tool({
    description:
      "Waits for a specified number of seconds. Useful for rate limiting or waiting between requests.",
    inputSchema: z.object({
      seconds: z
        .number()
        .min(1)
        .max(60)
        .describe("Number of seconds to wait (between 1 and 60)"),
    }),
    execute: async ({ seconds }) => {
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      return { success: true, waited: seconds };
    },
  }),
};
