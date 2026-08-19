import type { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ToolResult = CallToolResult;

export type InputShape = Record<string, z.ZodTypeAny>;

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: InputShape;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export function registerTool(server: McpServer, def: ToolDefinition): void {
  server.registerTool(
    def.name,
    { description: def.description, inputSchema: def.inputSchema },
    async (args) => {
      try {
        return await def.handler((args ?? {}) as Record<string, unknown>);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}

export function jsonResult(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function textResult(text: string): ToolResult {
  return { content: [{ type: "text", text }] };
}

export function errorResult(message: string): ToolResult {
  return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
}

export function requiredString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${key} is required and must be a non-empty string`);
  }
  return value.trim();
}