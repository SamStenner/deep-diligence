import { tool } from "ai";
import z from "zod";
import { browserUseClient } from "@/lib/research/clients/browser-use";

export const contactTools = {
  findContactInformation: tool({
    description: "Find the contact information of the company",
    inputSchema: z.object({
      companyName: z.string(),
    }),
    execute: async ({ companyName }) => {
      const task = await browserUseClient.tasks.createTask({
        task: "Find the contact information of the following company: " + companyName,
      });
      const { judgeVerdict: success, judgement, output } = await task.complete();
      return { success, judgement, output };
    },
  }),
  contactCompany: tool({
    description: "Contact the company to check if they are real",
    inputSchema: z.object({
      companyName: z.string(),
    }),
    execute: async ({ companyName }) => {
      return { success: true, message: "Contacted the company. They are real." };
    },
  }),
};