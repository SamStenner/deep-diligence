import { wait } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/data/client";
import { emailConversations } from "@/lib/data/schema";
import type { EmailReplyPayload } from "@/trigger/research.task";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend inbound email webhook payload type (basic metadata only)
// https://resend.com/docs/dashboard/webhooks/event-types#email-received
interface ResendInboundEmailPayload {
  type: "email.received";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    message_id: string;
    attachments: unknown[];
    created_at: string;
  };
}

/**
 * Extract the conversation ID from plus-addressed "to" field.
 * Format: reply+{conversationId}@domain
 */
function extractConversationId(toAddresses: string[]): string | null {
  for (const addr of toAddresses) {
    // Match reply+{id}@domain pattern
    const match = addr.match(/^reply\+([^@]+)@/i);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Fetch full email content from Resend to get body text.
 */
async function getEmailText(emailId: string): Promise<string | null> {
  try {
    const response = await resend.emails.receiving.get(emailId);
    if (!response.data) {
      console.error("Failed to fetch email content:", response.error?.message);
      return null;
    }
    return response.data?.text || null;
  } catch (error) {
    console.error("Failed to fetch email details:", error);
    return null;
  }
}

/**
 * Webhook handler for receiving inbound emails from Resend.
 * This resumes the waiting Trigger.dev task when an email reply arrives.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ResendInboundEmailPayload;

    // Verify this is an email received event
    if (payload.type !== "email.received") {
      return NextResponse.json({
        ok: true,
        message: "Ignored non-email event",
      });
    }

    const incomingEmailId = payload.data.email_id;

    console.log("Received inbound email webhook", {
      incomingEmailId,
      subject: payload.data.subject,
      from: payload.data.from,
      to: payload.data.to,
    });

    // Extract conversation ID from plus-addressed "to" field
    const conversationId = extractConversationId(payload.data.to);

    console.log("Extracted conversation ID:", conversationId);

    if (!conversationId) {
      console.warn("No conversation ID found in to address:", payload.data.to);
      return NextResponse.json(
        { error: "Email is not a reply to a tracked conversation" },
        { status: 400 },
      );
    }

    // Fetch the email body
    const emailText = await getEmailText(incomingEmailId);

    // Find the conversation by matching the conversation ID (stored in messageId field)
    const conversations = await db
      .select()
      .from(emailConversations)
      .where(eq(emailConversations.messageId, conversationId));

    const pendingConversation = conversations.find(
      (c) => c.status === "pending",
    );

    if (!pendingConversation) {
      console.warn("No pending conversation found for ID:", conversationId);
      return NextResponse.json(
        { error: "No pending conversation found for this reply" },
        { status: 404 },
      );
    }

    const projectId = pendingConversation.projectId;

    // Update the conversation record
    await db
      .update(emailConversations)
      .set({
        status: "replied",
        repliedAt: new Date(),
        replyContent: emailText,
      })
      .where(eq(emailConversations.id, pendingConversation.id));

    if (!pendingConversation.waitTokenId) {
      console.warn(
        "No wait token found for conversation:",
        pendingConversation.id,
      );
      return NextResponse.json(
        { error: "No wait token found for this conversation" },
        { status: 400 },
      );
    }

    // Resume the waiting Trigger.dev task
    const replyPayload: EmailReplyPayload = {
      projectId: pendingConversation.projectId,
      emailId: pendingConversation.emailId!,
      from: payload.data.from,
      subject: payload.data.subject,
      content: emailText || "",
      receivedAt: payload.created_at,
    };

    // Complete the waitpoint token to resume the task
    await wait.completeToken<EmailReplyPayload>(
      pendingConversation.waitTokenId,
      replyPayload,
    );

    console.log("Email reply processed for project:", projectId);
    return NextResponse.json({ ok: true, projectId });
  } catch (error) {
    console.error("Error processing email webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
