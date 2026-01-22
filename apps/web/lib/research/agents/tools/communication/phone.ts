import { createLogger } from "@/lib/logger";
import { PhoneCallPayload } from "@/trigger/research.task";
import { wait } from "@trigger.dev/sdk";

const phoneLog = createLogger("phone");

/**
 * Create a waitpoint token for a phone call completion.
 * This should be called when initiating a call to set up the wait.
 * Returns the token ID that should be stored with the phone conversation.
 */
export async function createPhoneWaitToken(
  conversationId: string,
  timeoutMinutes: number = 10
): Promise<string> {
  const token = await wait.createToken({
    timeout: `${timeoutMinutes}m`,
    tags: [`phone:${conversationId}`],
    idempotencyKey: `phone-call-${conversationId}`,
    idempotencyKeyTTL: `${timeoutMinutes + 5}m`,
  });

  phoneLog.info("Created phone wait token", { conversationId, tokenId: token.id });
  return token.id;
}

/**
 * Wait for a phone call to complete using an existing wait token.
 * The token should have been created when the call was initiated.
 */
export async function waitForPhoneCallToken(
  tokenId: string
): Promise<PhoneCallPayload | null> {
  phoneLog.info("Waiting for phone call completion", { tokenId });

  const result = await wait.forToken<PhoneCallPayload>({ id: tokenId });

  if (!result.ok) {
    phoneLog.warn("Phone call timeout", { tokenId });
    return null;
  }

  phoneLog.info("Phone call completed", { tokenId });
  return result.output;
}
