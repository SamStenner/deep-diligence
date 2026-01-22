import { logger, task } from "@trigger.dev/sdk/v3";
import { contactAgent } from "@/lib/research/agents/contact.agent";
import { createLogger } from "@/lib/logger";
import { executePhoneCall } from "@/lib/research/agents/tools/communication/phone-call";

const testLog = createLogger("test-contact");

export const testCall = task({
  id: "test-call",
  maxDuration: 3600, // 1 hour
  run: async ({
    phoneNumber,
    projectId,
  }: {
    phoneNumber: string;
    projectId: string;
  }) => {
    logger.log("Starting call test", { phoneNumber });
    testLog.info("Starting call test", { phoneNumber });

    try {
      const output = await executePhoneCall({ to: phoneNumber, prompt: "You are an agent that just needs to confirm the name of the person on the other end of the phone call. Once they have shared their name, you should end the call.", firstMessage: "Hello, what is your name?" }, { projectId });

      testLog.info("Call completed", { output });
      logger.log("Call completed", { output });

      return {
        success: true,
        output,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      testLog.error("Call failed", { error: message });
      logger.error("Call failed", { error: message });

      return {
        success: false,
        error: message,
      };
    }
  },
});
