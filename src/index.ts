import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTool, type ToolDefinition } from "./tool.js";

import { getTermTool, listTermsTool } from "./tools/terms.js";
import {
  checkCourseExistsTool,
  getProgramTool,
  getSectionFeesTool,
  getSyllabusIndexTool,
  listCoursePrefixesTool,
  listProgramsTool,
  listSchoolsTool,
  listSessionsTool,
} from "./tools/catalog.js";
import { getCourseTool, listCoursesByProgramTool, searchCoursesTool } from "./tools/courses.js";
import {
  getGeCategoryDetailsTool,
  listCoursesByGeTool,
  listGeRequirementsTool,
} from "./tools/ge.js";

const tools: ToolDefinition[] = [
  // Terms
  listTermsTool,
  getTermTool,
  // Catalog structure
  listSchoolsTool,
  listProgramsTool,
  getProgramTool,
  listCoursePrefixesTool,
  listSessionsTool,
  checkCourseExistsTool,
  getSyllabusIndexTool,
  getSectionFeesTool,
  // Courses & search
  searchCoursesTool,
  getCourseTool,
  listCoursesByProgramTool,
  // GE
  listGeRequirementsTool,
  listCoursesByGeTool,
  getGeCategoryDetailsTool,
];

const server = new McpServer({
  name: "usc-course-catalog",
  version: "0.1.1",
});

for (const tool of tools) {
  registerTool(server, tool);
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});