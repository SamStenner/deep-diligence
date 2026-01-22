import { createLogger } from "@/lib/logger";
import { tool } from "ai";
import z from "zod";

const log = createLogger("utility-tools");

export const utilityTools = {

  getCurrentDateTime: tool({
    title: "Get Date and Time",
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
    title: "Calculator",
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
    title: "Delay",
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

export type UtilityTools = keyof typeof utilityTools;

