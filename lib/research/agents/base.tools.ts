import { tool } from "ai";
import z from "zod";
import { browserUseClient } from "../clients/browser-use";
import { createLogger } from "@/lib/logger";
import { firecrawl, isDocument } from "../clients/firecrawl";

const log = createLogger("base-tools");

export const webTools = {
  searchWeb: tool({
    description:
      "Searches the web for information. Not a full browser experience, but provides a simpler and faster way to search the web.",
    inputSchema: z.object({
      query: z.string().describe("The query to search the web for."),
      limit: z.number().optional().default(5).describe("The number of results to return. Defaults to 5."),
    }),
    execute: async ({ query, limit }) => {
      const results = await firecrawl.search(query, {
        limit,
        sources: ["web"],
        categories: ["research"],
      })
      return results.web!.map((result) => {
        if (isDocument(result)) return result.markdown; 
        else return null;
      }).filter(result => result !== null);
    },
  }),
  browseWeb: tool({
    description:
      "Browses the web for information. Provides a full visual browser experience, navigating through the web and providing a full context of the page. This is useful if you need to find information on a website that requires interactivity or visual inspection.",
    inputSchema: z.object({
      website: z.string(),
      prompt: z.string().describe("The task to perform on the web."),
    }),
    execute: async ({ website, prompt }) => {
      log.tool("browseWeb", { website, prompt: prompt.slice(0, 100) });

      const task = await browserUseClient.tasks.createTask({
        task: prompt,
      });

      log.info("Browser task created, waiting for completion");
      const { judgeVerdict: success, judgement, output } = await task.complete();

      log.toolResult("browseWeb", { success, judgement });
      return { success, judgement, output };
    },
  }),
}
export const utilityTools = {

  getCurrentDateTime: tool({
    description:
      "Gets the current date and time. Useful for understanding temporal context when researching time-sensitive information.",
    inputSchema: z.object({}),
    execute: async () => {
      log.tool("getCurrentDateTime", {});

      const now = new Date();
      const result = {
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

      log.toolResult("getCurrentDateTime", { iso: result.iso });
      return result;
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
      log.tool("calculate", { expression });

      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      if (sanitized !== expression.replace(/\s/g, "").replace(/\s/g, "")) {
        log.error("Invalid expression", { expression });
        throw new Error("Expression contains invalid characters");
      }

      const result = new Function(`return (${sanitized})`)();
      if (typeof result !== "number" || !isFinite(result)) {
        log.error("Invalid result", { expression, result });
        throw new Error("Result is not a valid number");
      }

      log.toolResult("calculate", { result });
      return result;
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
      log.tool("delay", { seconds });

      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

      log.toolResult("delay", { waited: seconds });
      return { success: true, waited: seconds };
    },
  }),
};

export const baseTools = {
  ...webTools,
  ...utilityTools,
}