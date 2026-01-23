import { wait } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/data/client";
import { phoneConversations } from "@/lib/data/schema";
import type { PhoneCallPayload } from "@/trigger/research.task";

// ElevenLabs webhook payload types
interface ElevenLabsTranscriptEntry {
  role: "agent" | "user";
  message: string;
  time_in_call_secs: number;
  // Additional fields we don't need
  agent_metadata?: unknown;
  tool_calls?: unknown[];
  tool_results?: unknown[];
  interrupted?: boolean;
  original_message?: string | null;
  source_medium?: string | null;
}

interface ElevenLabsAnalysis {
  call_successful: string;
  transcript_summary: string;
  call_summary_title: string;
  evaluation_criteria_results?: unknown;
  data_collection_results?: unknown;
}

interface ElevenLabsPhoneCallMetadata {
  direction: string;
  phone_number_id: string;
  agent_number: string;
  external_number: string;
  type: string;
  stream_sid: string;
  call_sid: string;
}

interface ElevenLabsWebhookPayload {
  type: string;
  event_timestamp: number;
  data: {
    agent_id: string;
    conversation_id: string;
    status: string;
    user_id: string;
    transcript: ElevenLabsTranscriptEntry[];
    metadata: {
      start_time_unix_secs: number;
      call_duration_secs: number;
      termination_reason: string;
      phone_call: ElevenLabsPhoneCallMetadata;
      error?: string | null;
    };
    analysis: ElevenLabsAnalysis;
  };
}

/**
 * Map ElevenLabs status and termination reason to our phone status enum.
 */
function mapToPhoneStatus(
  status: string,
  terminationReason: string,
): "completed" | "failed" | "no_answer" {
  if (status === "done") {
    // Check termination reason for more granular status
    if (terminationReason.toLowerCase().includes("no answer")) {
      return "no_answer";
    }
    return "completed";
  }
  return "failed";
}

/**
 * Webhook handler for receiving phone call completion events from ElevenLabs.
 * This resumes the waiting Trigger.dev task when a call completes.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ElevenLabsWebhookPayload;

    console.log("Received ElevenLabs webhook", {
      type: payload.type,
      conversationId: payload.data?.conversation_id,
      status: payload.data?.status,
    });

    // Only process post_call_transcription events
    if (payload.type !== "post_call_transcription") {
      return NextResponse.json({
        ok: true,
        message: `Ignored event type: ${payload.type}`,
      });
    }

    const conversationId = payload.data.conversation_id;
    const callStatus = payload.data.status;
    const terminationReason = payload.data.metadata.termination_reason;
    const callDurationSecs = payload.data.metadata.call_duration_secs;
    const callSid = payload.data.metadata.phone_call?.call_sid;

    console.log("Processing phone call completion", {
      conversationId,
      callStatus,
      terminationReason,
      callDurationSecs,
      callSid,
    });

    // Find the pending conversation by conversationId
    const conversations = await db
      .select()
      .from(phoneConversations)
      .where(eq(phoneConversations.conversationId, conversationId));

    const pendingConversation = conversations.find(
      (c) => c.status === "pending",
    );

    if (!pendingConversation) {
      console.warn("No pending conversation found for ID:", conversationId);
      return NextResponse.json(
        { error: "No pending conversation found for this call" },
        { status: 404 },
      );
    }

    const projectId = pendingConversation.projectId;

    // Transform transcript to our format
    const transcript = payload.data.transcript.map((entry) => ({
      role: entry.role,
      message: entry.message,
      timeInCallSecs: entry.time_in_call_secs,
    }));

    // Transform analysis to our format
    const analysis = {
      callSuccessful: payload.data.analysis.call_successful,
      transcriptSummary: payload.data.analysis.transcript_summary,
      callSummaryTitle: payload.data.analysis.call_summary_title,
    };

    // Map to our status enum
    const phoneStatus = mapToPhoneStatus(callStatus, terminationReason);

    // Update the conversation record
    await db
      .update(phoneConversations)
      .set({
        status: phoneStatus,
        callSid: callSid || pendingConversation.callSid,
        transcript,
        analysis,
        callDurationSecs,
        terminationReason,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(phoneConversations.id, pendingConversation.id));

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
    const callPayload: PhoneCallPayload = {
      projectId: pendingConversation.projectId,
      conversationId,
      transcript,
      analysis,
      callDurationSecs,
      terminationReason,
    };

    // Complete the waitpoint token to resume the task
    await wait.completeToken<PhoneCallPayload>(
      pendingConversation.waitTokenId,
      callPayload,
    );

    console.log("Phone call processed for project:", projectId);
    return NextResponse.json({ ok: true, projectId });
  } catch (error) {
    console.error("Error processing phone webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
