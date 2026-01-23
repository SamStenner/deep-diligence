import {
  type DynamicToolUIPart,
  getToolName,
  InferUITools,
  isToolUIPart,
  type ModelMessage,
  type ToolUIPart,
  UIDataTypes,
  type UIMessage,
  type UITools,
} from "ai";

export function modelMessagesToUiMessage<T extends UIMessage = UIMessage, Metadata = unknown>(
  modelMessages: ModelMessage[],
  assistantChatMessageId: string,
  metadata?: Metadata
): T {
  const uiMessage: UIMessage = {
    id: assistantChatMessageId,
    role: "assistant",
    parts: [],
    metadata,
  };

  for (const modelMessage of modelMessages) {
    switch (modelMessage.role) {
      case "assistant": {
        if (Array.isArray(modelMessage.content)) {
          for (const content of modelMessage.content) {
            switch (content.type) {
              case "text":
                uiMessage.parts.push({
                  type: "text",
                  text: content.text,
                  ...(content.providerOptions
                    ? { providerMetadata: content.providerOptions }
                    : {}),
                });
                break;
              case "reasoning":
                uiMessage.parts.push({
                  type: "reasoning",
                  text: content.text,
                  providerMetadata: content.providerOptions,
                });
                break;
              case "file":
                uiMessage.parts.push({
                  type: "file",
                  mediaType: content.mediaType,
                  filename: content.filename,
                  url:
                    typeof content.data === "string"
                      ? content.data
                      : content.data.toString(),
                  ...(content.providerOptions
                    ? { providerMetadata: content.providerOptions }
                    : {}),
                });
                break;
              case "tool-call":
                {
                  const toolPart: ToolUIPart = {
                    type: `tool-${content.toolName}`,
                    toolCallId: content.toolCallId,
                    title: content.toolName,
                    input: content.input,
                    state: "input-available",
                    ...(content.providerOptions
                      ? { callProviderMetadata: content.providerOptions }
                      : {}),
                  };
                  uiMessage.parts.push(toolPart);
                }
                break;
              case "tool-result": {
                // Attach tool results to existing tool-call part in this assistant message if found
                const toolPart = uiMessage.parts.find(
                  (part) =>
                    isToolUIPart(part) &&
                    part.toolCallId === content.toolCallId,
                ) as ToolUIPart<UITools> | DynamicToolUIPart | undefined;

                if (toolPart) {
                  if ("value" in content.output) {
                    toolPart.output = content.output.value;
                  }
                  const outputStr =
                    typeof content.output === "string"
                      ? content.output
                      : JSON.stringify(content.output);
                  if (
                    outputStr.includes("Error:") ||
                    outputStr.includes("error:")
                  ) {
                    toolPart.state = "output-error";
                    if ("errorText" in toolPart) {
                      (
                        toolPart as DynamicToolUIPart & { errorText?: string }
                      ).errorText = outputStr;
                    }
                  } else {
                    toolPart.state = "output-available";
                  }
                }
                break;
              }
            }
          }
        }

        break;
      }

      case "tool": {
        // Tool messages typically contain results that should be associated with previous assistant messages
        // Find the last assistant message and update its tool parts with results
        if (uiMessage && Array.isArray(modelMessage.content)) {
          for (const content of modelMessage.content) {
            if (content.type === "tool-result") {
              // Find the corresponding tool part in the assistant message
              const toolPart = uiMessage.parts.find(
                (part) =>
                  isToolUIPart(part) && part.toolCallId === content.toolCallId,
              ) as ToolUIPart<UITools> | DynamicToolUIPart | undefined;

              if (toolPart) {
                if ("value" in content.output) {
                  toolPart.output = content.output.value;
                }
                // Check if the output indicates an error
                const outputStr =
                  typeof content.output === "string"
                    ? content.output
                    : JSON.stringify(content.output);
                if (
                  outputStr.includes("Error:") ||
                  outputStr.includes("error:")
                ) {
                  toolPart.state = "output-error";
                  if ("errorText" in toolPart) {
                    (
                      toolPart as DynamicToolUIPart & { errorText?: string }
                    ).errorText = outputStr;
                  }
                } else {
                  toolPart.state = "output-available";
                }
              }
            }
          }
        }
        break;
      }
    }
  }

  return uiMessage as T;
}
