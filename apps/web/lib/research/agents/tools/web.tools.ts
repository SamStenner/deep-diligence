import { createLogger } from "@/lib/logger";
import { tool } from "ai";
import z from "zod";
import { firecrawl, browserUse } from "@/lib/research/clients";

const log = createLogger("web-tools");

export const webTools = {
  searchWeb: tool({
    title: "Search Web",
    description:
      "Searches the web for information. Uses DuckDuckGo to search the web and returns search results. Use with the scrapeWebsites tool to get the website's content.",
    inputSchema: z.object({
      query: z.string().describe("The query to search the web for."),
      limit: z.number().optional().default(3).describe("The number of results to return. Defaults to 3."),
    }),
    execute: async ({ query, limit }) => {
      log.tool("searchWeb", { query, limit });
      const response = await firecrawl.search(query, {
        limit,
      })
      log.toolResult("searchWeb", { response: response.web?.length ?? 0 });
      return response.web
    },
  }),
  scrapeWeb: tool({
    title: "Visit Website",
    description:
      "Scrapes a specific website for information. This is useful if you want to visit one of the websites returned by the searchWeb tool.",
    inputSchema: z.object({
      url: z.url().describe("The website to scrape."),
    }),
    execute: async ({ url }) => {
      log.tool("scrapeWeb", { url });
      const response = await firecrawl.scrape(url, {
        excludeTags: ["img"],
        removeBase64Images: true,
      });
      log.info("Scrape response", { keys: Object.keys(response) });
      log.toolResult("scrapeWeb", { response });
      return { summary: response.summary, markdown: response.markdown };
    },
  }),
  browseWeb: tool({
    title: "Browse Web",
    description:
      "Browses the web for information. Provides a full visual browser experience, navigating through the web and providing a full context of the page. This is useful if you need to find information on a website that requires interactivity or visual inspection. This is more powerful than just using search + scraping, as it allows you to fully interact with a browser like a person.",
    inputSchema: z.object({
      website: z.string(),
      prompt: z.string().describe("The task to perform on the web."),
    }),
    execute: async ({ website, prompt }) => {
      log.tool("browseWeb", { website, prompt: prompt.slice(0, 100) });

      const task = await browserUse.tasks.createTask({
        task: prompt,
      });

      log.info("Browser task created, waiting for completion");
      const { judgeVerdict: success, judgement, output } = await task.complete();

      log.toolResult("browseWeb", { success, judgement });
      return { success, judgement, output };
    },
  }),
}

export type WebTools = keyof typeof webTools;
