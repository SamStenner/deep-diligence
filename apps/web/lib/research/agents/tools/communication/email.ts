import { createLogger } from "@/lib/logger";
import { EmailReplyPayload } from "@/trigger/research.task";
import { wait } from "@trigger.dev/sdk";

const emailLog = createLogger("email");
/**
 * Create a waitpoint token for an email reply.
 * This should be called when sending an email to set up the wait.
 * Returns the token ID that should be stored with the email conversation.
 */
export async function createEmailWaitToken(
  emailId: string,
  timeoutDays: number = 7
): Promise<string> {
  const token = await wait.createToken({
    timeout: `${timeoutDays}d`,
    tags: [`email:${emailId}`],
    idempotencyKey: `email-reply-${emailId}`,
    idempotencyKeyTTL: `${timeoutDays + 1}d`,
  });

  emailLog.info("Created email wait token", { emailId, tokenId: token.id });
  return token.id;
}

/**
 * Wait for an email reply using an existing wait token.
 * The token should have been created when the email was sent.
 */
export async function waitForEmailReplyToken(
  tokenId: string
): Promise<EmailReplyPayload | null> {
  emailLog.info("Waiting for email reply", { tokenId });

  const result = await wait.forToken<EmailReplyPayload>({ id: tokenId });

  if (!result.ok) {
    emailLog.warn("Email reply timeout", { tokenId });
    return null;
  }

  emailLog.info("Email reply received", { tokenId });
  return result.output;
}
