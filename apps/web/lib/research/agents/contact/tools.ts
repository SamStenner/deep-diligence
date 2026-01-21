import { tool } from "ai";
import z from "zod";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { browserUseClient } from "@/lib/research/clients/browser-use";
import { db } from "@/lib/data/client";
import { emailConversations } from "@/lib/data/schema";
import {
  createEmailWaitToken,
  waitForEmailReplyToken,
} from "@/lib/research/agents/contact/email";
import { createLogger } from "@/lib/logger";
import { AgentContext } from "../sub.agents";
import { webTools } from "../base.tools";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "notifications.adam.new";
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || `hello@${EMAIL_DOMAIN}`;

const contactLog = createLogger("contact");

export const contactTools = {
  ...webTools,
  sendEmail: tool({
    title: "Send Email",
    description:
      "Send an email to contact the company and wait for their reply. This will send a real email and pause execution until a reply is received or timeout occurs (default 7 days). Use this after finding contact information.",
    inputSchema: z.object({
      to: z.email().describe("The email address to send to"),
      subject: z.string().describe("The email subject line"),
      body: z.string().describe("The email body content"),
      companyName: z.string().describe("The company name being contacted"),
      timeoutDays: z
        .number()
        .optional()
        .default(7)
        .describe("How many days to wait for a reply (default: 7)"),
    }),
    execute: async ({ to, subject, body, companyName, timeoutDays }, { experimental_context: context }) => {
      const { projectId } = context as AgentContext;
      contactLog.tool("sendEmail", { to, subject, projectId, companyName, timeoutDays });

      try {
        // Use plus-addressing for reply tracking: reply+{emailId}@domain
        // We'll generate a unique ID for this email conversation
        const conversationId = `${projectId}-${Date.now()}`;
        const replyToAddress = `reply+${conversationId}@${EMAIL_DOMAIN}`;
        
        contactLog.info("Sending email via Resend", { to, subject, replyTo: replyToAddress });

        // Send the email via Resend with plus-addressed reply-to
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [to],
          subject,
          text: body,
          replyTo: replyToAddress,
        });

        if (error) {
          contactLog.error("Failed to send email", { error: error.message });
          return {
            success: false,
            error: error.message,
            message: `Failed to send email: ${error.message}`,
          };
        }

        const emailId = data?.id;
        if (!emailId) {
          contactLog.error("No email ID returned from Resend");
          return {
            success: false,
            error: "no_email_id",
            message: "Failed to send email: no email ID returned",
          };
        }
        contactLog.info("Email sent successfully", { emailId, conversationId });

        // Create a wait token for this email
        contactLog.info("Creating wait token for email reply", { timeoutDays });
        const waitTokenId = await createEmailWaitToken(emailId, timeoutDays);
        contactLog.info("Wait token created", { waitTokenId });

        // Record the email conversation in the database
        // Store conversationId in messageId field for matching replies
        await db.insert(emailConversations).values({
          projectId,
          emailId,
          messageId: conversationId, // Using messageId field to store our conversation ID
          waitTokenId,
          recipientEmail: to,
          subject,
          body,
          status: "pending",
          sentAt: new Date(),
        });
        contactLog.info("Email conversation recorded in database", { conversationId });

        // Now wait for the reply
        contactLog.info("Waiting for email reply (this may take days)", {
          emailId,
          waitTokenId,
          timeoutDays,
        });

        const reply = await waitForEmailReplyToken(waitTokenId);

        if (!reply) {
          contactLog.warn("Email reply timed out", { emailId, timeoutDays });

          // Update status to timeout
          await db
            .update(emailConversations)
            .set({ status: "timeout" })
            .where(eq(emailConversations.emailId, emailId));

          return {
            success: false,
            timedOut: true,
            emailId,
            message: `No reply received within ${timeoutDays} days`,
          };
        }

        contactLog.info("Email reply received!", { emailId, from: reply.from });
        contactLog.toolResult("sendEmail", { success: true, from: reply.from });

        return {
          success: true,
          timedOut: false,
          emailId,
          reply: {
            from: reply.from,
            subject: reply.subject,
            content: reply.content,
            receivedAt: reply.receivedAt,
          },
          message: "Reply received.",
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        contactLog.error("sendEmail failed with exception", { error: message });
        return {
          success: false,
          error: message,
          message: `Failed to send email: ${message}`,
        };
      }
    },
  }),
};

export type ContactTools = keyof typeof contactTools;