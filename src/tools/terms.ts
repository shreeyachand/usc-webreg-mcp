import { get } from "../api.js";
import type { TermInfo } from "../types.js";
import { jsonResult, type ToolDefinition } from "../tool.js";
import { requireTermCode, termCodeSchema } from "../helpers.js";

export const listTermsTool: ToolDefinition = {
  name: "list_terms",
  description:
    "List all USC academic terms available in the course catalog, each with season, year, term code, and status. Use this to find the termCode for a given semester (e.g. 20263 = Fall 2026).",
  inputSchema: {},
  handler: async () => {
    const terms = await get<TermInfo[]>("/Terms/All");
    const summary = terms.map((t) => ({
      termCode: t.termCode,
      season: t.season,
      year: t.year,
      status: t.status,
      dateActive: t.dateActive,
    }));
    return jsonResult(summary);
  },
};

export const getTermTool: ToolDefinition = {
  name: "get_term",
  description:
    "Get details for a single academic term by its numeric termCode (e.g. 20263 = Fall 2026). Returns season, year, status, and activation date.",
  inputSchema: {
    termCode: termCodeSchema,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const term = await get<TermInfo>("/Terms/TermCode", { termCode });
    return jsonResult(term);
  },
};