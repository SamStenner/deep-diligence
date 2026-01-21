/**
 * Simple logging utility for debugging agents.
 * Wraps console.log with structured formatting and context.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const LOG_COLORS = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
  reset: "\x1b[0m",
} as const;

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) return "";
  return " " + JSON.stringify(context);
}

function log(level: LogLevel, prefix: string, message: string, context?: LogContext) {
  const timestamp = formatTimestamp();
  const color = LOG_COLORS[level];
  const reset = LOG_COLORS.reset;
  const contextStr = formatContext(context);
  
  const formatted = `${color}[${timestamp}] [${level.toUpperCase()}] [${prefix}]${reset} ${message}${contextStr}`;
  
  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Create a logger with a specific prefix (e.g., agent name)
 */
export function createLogger(prefix: string) {
  return {
    debug: (message: string, context?: LogContext) => log("debug", prefix, message, context),
    info: (message: string, context?: LogContext) => log("info", prefix, message, context),
    warn: (message: string, context?: LogContext) => log("warn", prefix, message, context),
    error: (message: string, context?: LogContext) => log("error", prefix, message, context),
    
    /** Log a tool call */
    tool: (toolName: string, input: unknown) => {
      log("info", prefix, `Tool called: ${toolName}`, { input });
    },
    
    /** Log a tool result */
    toolResult: (toolName: string, result: unknown) => {
      log("debug", prefix, `Tool result: ${toolName}`, { result });
    },
    
    /** Log agent step */
    step: (stepNumber: number, description: string) => {
      log("info", prefix, `Step ${stepNumber}: ${description}`);
    },
  };
}


