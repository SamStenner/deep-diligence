import { MessageResponse } from "./ai-elements/message";
import { StaticToolRenderer } from "./ai-elements/static-tools";
import { SubAgentUIMessage } from "@/lib/research/agents/sub.agents";
import { isStaticToolUIPart } from "ai";

export function Content({ parts }: { parts: SubAgentUIMessage["parts"] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        switch (part.type) {
          case "text":
            return (
              <div key={index} className="text-sm text-foreground leading-relaxed">
                <MessageResponse>{part.text}</MessageResponse>
              </div>
            );
          default:
            if (isStaticToolUIPart(part)) {
              return <StaticToolRenderer key={index} part={part} />;
            }
            return (
              <div key={index} className="rounded-lg border bg-muted/30 p-3 text-xs font-mono">
                <pre className="overflow-auto">{JSON.stringify(part, null, 2)}</pre>
              </div>
            );
        }
      })}
    </div>
  );
}
