import { eq } from "drizzle-orm";
import { createLogger } from "@/lib/logger";
import { db } from "@/lib/data/client";
import { phoneConversations } from "@/lib/data/schema";
import { elevenlabs } from "@/lib/research/clients/eleven-labs";
import {
  createPhoneWaitToken,
  waitForPhoneCallToken,
} from "@/lib/research/agents/tools/communication/phone";
import { AgentContext } from "../../types";

const contactLog = createLogger("contact");

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "agent_8301kfhhaca4ert90ghs9j0qcy7n";
const PHONE_NUMBER_ID = process.env.ELEVENLABS_PHONE_NUMBER_ID || "phnum_5201kfhj7swde5gvjjqasg1qeb6d";

interface PhoneCallInput {
  to: string;
  prompt: string;
  firstMessage: string;
  timeoutMinutes?: number;
  language?: string;
}

export async function executePhoneCall(
  { to, prompt, firstMessage, language, timeoutMinutes = 10 }: PhoneCallInput,
  context: AgentContext
) {
  const { projectId } = context;
  contactLog.tool("phoneCall", { to, projectId, timeoutMinutes });
  try {
    // Initiate the outbound call via ElevenLabs
    contactLog.info("Initiating outbound call via ElevenLabs", { to, agentId: AGENT_ID });
    
    const call = await elevenlabs.conversationalAi.twilio.outboundCall({
      agentId: AGENT_ID,
      agentPhoneNumberId: PHONE_NUMBER_ID,
      toNumber: to,
      conversationInitiationClientData: {
        conversationConfigOverride: {
          agent: {
            prompt: {
              prompt,
            },
            firstMessage,
            language,
          },
        }
      }
    });

    contactLog.info("Call initiated", { call });
    contactLog.info(`Call Successful: ${call.success}`);
    contactLog.info(`Call Message: ${call.message}`);

    // The response should contain the conversation_id
    const conversationId = call.conversationId;
    if (!conversationId) {
      contactLog.error("No conversation ID returned from ElevenLabs");
      return {
        success: false,
        error: "no_conversation_id",
        message: "Failed to initiate call: no conversation ID returned",
      };
    }
    contactLog.info("Call initiated successfully", { conversationId });

    // Create a wait token for this call
    contactLog.info("Creating wait token for phone call", { timeoutMinutes });
    const waitTokenId = await createPhoneWaitToken(conversationId, timeoutMinutes);
    contactLog.info("Wait token created", { waitTokenId });

    // Record the phone conversation in the database
    await db.insert(phoneConversations).values({
      projectId,
      conversationId,
      callSid: call.callSid,
      waitTokenId,
      toNumber: to,
      agentId: AGENT_ID,
      status: "pending",
      startedAt: new Date(),
    });
    contactLog.info("Phone conversation recorded in database", { conversationId });

    // Now wait for the call to complete
    contactLog.info("Waiting for phone call to complete (this may take minutes)", {
      conversationId,
      waitTokenId,
      timeoutMinutes,
    });

    const result = await waitForPhoneCallToken(waitTokenId);

    if (!result) {
      contactLog.warn("Phone call timed out", { conversationId, timeoutMinutes });

      // Update status to timeout
      await db
        .update(phoneConversations)
        .set({ status: "timeout" })
        .where(eq(phoneConversations.conversationId, conversationId));

      return {
        success: false,
        timedOut: true,
        conversationId,
        message: `Call did not complete within ${timeoutMinutes} minutes`,
      };
    }

    contactLog.info("Phone call completed!", { conversationId, terminationReason: result.terminationReason });
    contactLog.toolResult("phoneCall", { success: true, callDurationSecs: result.callDurationSecs });

    return {
      success: true,
      timedOut: false,
      conversationId,
      transcript: result.transcript,
      analysis: result.analysis,
      callDurationSecs: result.callDurationSecs,
      terminationReason: result.terminationReason,
      message: "Call completed.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    contactLog.error("phoneCall failed with exception", { error: message });
    return {
      success: false,
      error: message,
      message: `Failed to make phone call: ${message}`,
    };
  }
}
