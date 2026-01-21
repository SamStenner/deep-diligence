import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./ai-elements/tool";
import { Message, MessageContent, MessageResponse } from "./ai-elements/message";
import { SubAgentTools, SubAgentUIMessage, SubAgentUIOutput, SubAgentUITools } from "@/lib/research/agents/sub.agents";
import { InferToolOutput, isStaticToolUIPart, isToolUIPart } from "ai";
export function Content({ parts }: { parts: SubAgentUIMessage["parts"] }) {
  return <div className="space-y-4">
    {parts.map((part, index) => {
      switch (part.type) {
        case "text":
          return <Message from="assistant">
            <MessageContent>
              <MessageResponse>{part.text}</MessageResponse>
            </MessageContent>
          </Message>
        default:
          if (isStaticToolUIPart(part)) {
            return <Tool defaultOpen={false}>
              <ToolHeader title={part.title} type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                {part.output && <ToolOutput
                  output={<ToolOutputContent part={part} />}
                  errorText={part.errorText}
                />}
              </ToolContent>
            </Tool>
          }
          return <div key={index}>{JSON.stringify(part)}</div>;
      }
    })}
  </div>
}

function ToolOutputContent({ part }: { part: SubAgentUIMessage["parts"][number] }) {
  switch (part.type) {
    case "tool-browseWeb":
      return <Message from="assistant">
        <MessageContent>
          <MessageResponse>{part.output?.output ?? ""}</MessageResponse>
        </MessageContent>
      </Message>
    default:
      if (isToolUIPart(part)) {
        return <MessageResponse>
          {JSON.stringify(part.output)}
        </MessageResponse>
      }
      return <div>Unknown tool output</div>;
  }
}
