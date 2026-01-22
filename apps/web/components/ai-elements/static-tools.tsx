"use client";

import { cn } from "@/lib/utils";
import {
  Calculator,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Mail,
  MailCheck,
  MailWarning,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Search,
  Timer,
  XCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Streamdown } from "streamdown";
import { ToolUIPart, UITools } from "ai";
import { isSearchResult } from "@/lib/research/clients/firecrawl";
import type { Document, SearchResultWeb } from "@mendable/firecrawl-js";
import { SubAgentToolNames, SubAgentUITools } from "@/lib/research/agents/types/agent.types";

// ============================================================================
// Search Result & Document Cards
// ============================================================================

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function SearchResultCard({ result }: { result: SearchResultWeb }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-3 rounded-md bg-muted/30 border hover:bg-muted/50 hover:border-border transition-colors"
    >
      <div className="shrink-0 mt-0.5">
        <Link2 className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {result.title || "Untitled"}
          </span>
          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
        {result.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {result.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Globe className="size-3" />
          <span className="truncate">{getDomain(result.url)}</span>
        </div>
      </div>
    </a>
  );
}

function DocumentCard({ document }: { document: Document }) {
  const title = document.metadata?.title || document.metadata?.ogTitle || "Document";
  const url = document.metadata?.url;
  const preview = document.markdown?.slice(0, 200).trim();

  const content = (
    <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border hover:bg-muted/50 hover:border-border transition-colors">
      <div className="shrink-0 mt-0.5">
        <FileText className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground line-clamp-1">
            {title}
          </span>
          {url && (
            <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {preview}
            {document.markdown && document.markdown.length > 200 && "..."}
          </p>
        )}
        {url && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <Globe className="size-3" />
            <span className="truncate">{getDomain(url)}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {content}
      </a>
    );
  }

  return content;
}

// ============================================================================
// Type Definitions
// ============================================================================

type PickTools<T extends SubAgentToolNames> = ToolUIPart<Pick<SubAgentUITools, T>>;

type ToolProps<T extends SubAgentToolNames> = {
  className?: string;
  part: PickTools<T> & {
    state: "output-available"
  }
}

type SearchWebToolProps = ToolProps<"searchWeb">
export function SearchWebTool({ part, className, ...props }: SearchWebToolProps) {
  const { input, output } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Search Web</span>
            <span className="text-xs text-muted-foreground">{input.query}</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50 space-y-3">
          {output ? (
            typeof output === "object" ? (
              <div className="space-y-2">
                {output.map((item) =>
                  isSearchResult(item) ? (
                    <SearchResultCard key={item.url} result={item} />
                  ) : (
                    <DocumentCard key={item.metadata?.url} document={item} />
                  )
                )}
              </div>
            ) : (
              <Streamdown>{output}</Streamdown>
            )
          ) : (
            <p className="text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type ScrapeWebsitesToolProps = ToolProps<"scrapeWeb">
export function ScrapeWebsitesTool({ part, className, ...props }: ScrapeWebsitesToolProps) {
  const { input, output } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <FileText className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Visit Website</span>
            <span className="text-xs text-muted-foreground">{input.url}</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50 space-y-3">
          <Streamdown>{output.markdown}</Streamdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
type BrowseWebToolProps = ToolProps<"browseWeb">

export function BrowseWebTool({ part, className, ...props }: BrowseWebToolProps) {
  const { input, output } = part;
  const domain = (() => {
    try {
      return new URL(input.website).hostname.replace('www.', '');
    } catch {
      return input.website;
    }
  })();

  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Globe className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Browse Web</span>
            <span className="text-xs text-muted-foreground">{domain}</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50 space-y-3">
          <div className="flex items-start gap-2">
            <Search className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{input.prompt}</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            {output.judgement && (
              <p className="text-sm text-foreground">{output.judgement}</p>
            )}
            {output.output && (
              <p className="text-muted-foreground text-xs leading-relaxed">
                <Streamdown>
                  {output.output}
                </Streamdown>
              </p>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type CalculateToolProps = ToolProps<"calculate">

export function CalculateTool({ part, className, ...props }: CalculateToolProps) {
  const { input, output } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Calculator className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Calculate</span>
            <code className="text-xs font-mono text-muted-foreground">
              = {typeof output === "number" ? output.toLocaleString() : output}
            </code>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50">
          <div className="flex items-center gap-3">
            <code className="text-sm font-mono bg-muted/50 px-3 py-1.5 rounded-md border">
              {input.expression}
            </code>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type DelayToolProps = ToolProps<"delay">

export function DelayTool({ part, className, ...props }: DelayToolProps) {
  const { input } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Timer className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Delay</span>
            <span className="text-xs text-muted-foreground">{input.seconds}s</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50">
          <p className="text-sm text-muted-foreground">
            Waiting {input.seconds} seconds...
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type GetCurrentDateTimeToolProps = ToolProps<"getCurrentDateTime">

export function GetCurrentDateTimeTool({ part, className, ...props }: GetCurrentDateTimeToolProps) {
  const { output } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Calendar className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Date & Time</span>
            {output && (
              <span className="text-xs text-muted-foreground">{output.date}</span>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50">
          <p className="text-sm text-muted-foreground">
            Current date and time: {output.date}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type SendEmailToolProps = ToolProps<"sendEmail">

export function SendEmailTool({ part, className, ...props }: SendEmailToolProps) {
  const { input, output } = part;
  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Mail className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Send Email</span>
            <span className="text-xs text-muted-foreground truncate">{input.to}</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50 space-y-3">
          {/* Email Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{input.to}</span>
              {input.timeoutDays && (
                <>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {input.timeoutDays}d timeout
                  </span>
                </>
              )}
            </div>
            <p className="text-sm font-medium">{input.subject}</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{input.body}</p>
          </div>
          {/* Output */}
          <div className="pt-3 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2">
              {output.success ? (
                <MailCheck className="size-4 text-emerald-600 shrink-0" />
              ) : output.timedOut ? (
                <MailWarning className="size-4 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="size-4 text-destructive shrink-0" />
              )}
              <span className="text-sm font-medium">
                {output.success
                  ? "Reply received"
                  : output.timedOut
                    ? "No reply received"
                    : "Failed to send"}
              </span>
            </div>

            {output.message && (
              <p className="text-xs text-muted-foreground">{output.message}</p>
            )}

            {/* Reply Content */}
            {output.reply && (
              <div className="space-y-2 p-3 rounded-md bg-muted/30 border">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">From:</span> {output.reply.from}
                </div>
                <p className="text-sm font-medium">{output.reply.subject}</p>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {output.reply.content}
                </p>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type PhoneCallToolProps = ToolProps<"phoneCall">

export function PhoneCallTool({ part, className, ...props }: PhoneCallToolProps) {
  const { input, output } = part;

  const formatDuration = (secs?: number) => {
    if (!secs) return null;
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.round(secs % 60);
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <Collapsible defaultOpen={false} className={cn("group/tool", className)} {...props}>
      <CollapsibleTrigger className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Phone className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Phone Call</span>
            <span className="text-xs text-muted-foreground truncate">{input.to}</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/tool:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 ml-7 border-l border-border/50 space-y-3">
          {/* Call Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{input.to}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{input.prompt}</p>
          </div>

          {/* Output */}
          <div className="pt-3 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2">
              {output.success ? (
                <PhoneCall className="size-4 text-emerald-600 shrink-0" />
              ) : output.timedOut ? (
                <PhoneMissed className="size-4 text-amber-600 shrink-0" />
              ) : (
                <PhoneOff className="size-4 text-destructive shrink-0" />
              )}
              <span className="text-sm font-medium">
                {output.success
                  ? "Call completed"
                  : output.timedOut
                    ? "Call timed out"
                    : "Call failed"}
              </span>
              {output.callDurationSecs && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDuration(output.callDurationSecs)}
                </span>
              )}
            </div>

            {output.message && (
              <p className="text-xs text-muted-foreground">{output.message}</p>
            )}

            {/* Transcript */}
            {output.transcript && output.transcript.length > 0 && (
              <div className="space-y-2 p-3 rounded-md bg-muted/30 border">
                <div className="text-xs font-medium text-muted-foreground">Transcript</div>
                <div className="space-y-2 text-xs">
                  {output.transcript.map((turn, i) => (
                    <div key={i} className={cn(
                      "flex gap-2",
                      turn.role === "agent" ? "text-muted-foreground" : "text-foreground"
                    )}>
                      <span className="font-medium shrink-0">
                        {turn.role === "agent" ? "Agent:" : "User:"}
                      </span>
                      <span className="leading-relaxed">{turn.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis */}
            {output.analysis && (
              <div className="space-y-2 p-3 rounded-md bg-muted/30 border">
                <div className="text-xs font-medium text-muted-foreground">Analysis</div>
                <div className="space-y-1 text-xs">
                  {output.analysis.callSummaryTitle && (
                    <p className="font-medium text-foreground">{output.analysis.callSummaryTitle}</p>
                  )}
                  {output.analysis.transcriptSummary && (
                    <p className="text-muted-foreground leading-relaxed">{output.analysis.transcriptSummary}</p>
                  )}
                  {output.analysis.callSuccessful && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Result:</span> {output.analysis.callSuccessful}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Tool Router - Maps tool names to components
// ============================================================================

interface StaticToolPartProps {
  part: ToolUIPart<SubAgentUITools>
}

export function StaticToolRenderer({ part }: StaticToolPartProps) {
  if (part.state !== "output-available") return null;
  switch (part.type) {
    case "tool-searchWeb":
      return <SearchWebTool part={part} />;
    case "tool-scrapeWeb":
      return <ScrapeWebsitesTool part={part} />;
    case "tool-browseWeb":
      return <BrowseWebTool part={part} />
    case "tool-calculate":
      return <CalculateTool part={part} />
    case "tool-delay":
      return <DelayTool part={part} />
    case "tool-getCurrentDateTime":
      return <GetCurrentDateTimeTool part={part} />
    case "tool-sendEmail":
      return <SendEmailTool part={part} />
    case "tool-phoneCall":
      return <PhoneCallTool part={part} />
    default:
      // Fallback for unknown tools
      return (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Unknown tool: {(part as ToolUIPart<UITools>).type}
          </p>
        </div>
      );
  }
}
