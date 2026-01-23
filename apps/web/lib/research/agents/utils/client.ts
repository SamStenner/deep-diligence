import type { ToolSet } from "ai";

/**
 * Filters out disabled tools from a toolset
 */
export const disableTools = <T extends ToolSet>(
  tools: T,
  disabledTools: (keyof T)[],
) =>
  (Object.keys(tools) as (keyof T)[]).filter(
    (tool) => !disabledTools.includes(tool),
  );
