import { logger, task } from "@trigger.dev/sdk/v3";
import { contactAgent } from "@/lib/research/agents/contact";
import { createLogger } from "@/lib/logger";

const testLog = createLogger("test-contact");



export const testContactAgentTask = task({
  id: "test-contact-agent",
  maxDuration: 3600, // 1 hour
  run: async ({
    companyName,
    website,
    email,
    projectId,
  }: {
    companyName: string;
    website: string;
    projectId: string;
    email?: string;
  }) => {
    logger.log("Starting contact agent test", { companyName, website, email });
    testLog.info("Starting contact agent test", { companyName, website, email });

    const prompt = `Contact the company "${companyName}" (${website}${email ? `, ${email}` : ''}) to verify they are a real company. Send them a professional email asking about their business. The project ID is ${projectId}.`

    testLog.info("Running contact agent with prompt", { prompt });

    try {
      const output = await contactAgent({ projectId }).generate({ prompt });

      testLog.info("Contact agent completed", {
        messageCount: output.response.messages.length,
      });

      logger.log("Contact agent completed", {
        messageCount: output.response.messages.length,
      });

      return {
        success: true,
        messages: output.response.messages,
        text: output.text,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      testLog.error("Contact agent failed", { error: message });
      logger.error("Contact agent failed", { error: message });

      return {
        success: false,
        error: message,
      };
    }
  },
});
