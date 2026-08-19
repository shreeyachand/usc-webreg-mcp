import { z } from "zod";
import { get } from "../api.js";
import type { Course, GeCategoryDetails, GeSummary } from "../types.js";
import { jsonResult, type ToolDefinition } from "../tool.js";
import { requireTermCode, termCodeSchema, parseFilters, sectionFiltersShape } from "../helpers.js";
import { filterCourses } from "../filters.js";

const stringField = z.string().min(1);

export const listGeRequirementsTool: ToolDefinition = {
  name: "list_ge_requirements",
  description:
    "List USC General Education (GE) requirements for a term. Returns the GE structure grouped by requirement era ('Fall2015OrLater' for current students, 'BeforeFall2015' for older catalogs). Each requirement has a prefix and categories with prefixes (e.g. GE B 'Humanistic Inquiry' is category prefix 'HINQ' under requirement 'ACORELIT'). Use the prefixes with list_courses_by_ge.",
  inputSchema: {
    termCode: termCodeSchema,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const ge = await get<GeSummary>("/Ge/TermCode", { termCode });
    return jsonResult(ge);
  },
};

export const listCoursesByGeTool: ToolDefinition = {
  name: "list_courses_by_ge",
  description:
    "List all courses in a term that satisfy a General Education (GE) category, with their sections. Requires the GE requirement prefix and category prefix, which can be discovered via list_ge_requirements (e.g. GE B 'Humanistic Inquiry' = geRequirementPrefix 'ACORELIT', geCategoryPrefix 'HINQ'). Supports optional section filters (days, startAfter, startBefore, openOnly) applied client-side.",
  inputSchema: {
    termCode: termCodeSchema,
    geRequirementPrefix: stringField.describe(
      "GE requirement prefix from list_ge_requirements (e.g. 'ACORELIT' for Core Literacies).",
    ),
    geCategoryPrefix: stringField.describe(
      "GE category prefix from list_ge_requirements (e.g. 'HINQ' for GE B Humanistic Inquiry).",
    ),
    ...sectionFiltersShape,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const geRequirementPrefix =
      typeof args.geRequirementPrefix === "string" ? args.geRequirementPrefix.trim() : "";
    const geCategoryPrefix = typeof args.geCategoryPrefix === "string" ? args.geCategoryPrefix.trim() : "";
    if (geRequirementPrefix === "") throw new Error("geRequirementPrefix is required");
    if (geCategoryPrefix === "") throw new Error("geCategoryPrefix is required");

    const result = await get<{
      geRequirementPrefix: string;
      geCategoryPrefix: string;
      termCode: number;
      courses: Course[];
    }>("/Courses/GeCoursesByTerm", {
      termCode,
      geRequirementPrefix,
      categoryPrefix: geCategoryPrefix,
    });

    const filters = parseFilters({
      days: args.days as string[] | undefined,
      startAfter: args.startAfter as string | undefined,
      startBefore: args.startBefore as string | undefined,
      openOnly: args.openOnly as boolean | undefined,
    });
    const courses = filterCourses(result.courses ?? [], filters);
    return jsonResult({
      termCode,
      geRequirementPrefix: result.geRequirementPrefix,
      geCategoryPrefix: result.geCategoryPrefix,
      courseCount: courses.length,
      courses,
    });
  },
};

export const getGeCategoryDetailsTool: ToolDefinition = {
  name: "get_ge_category_details",
  description:
    "Get the name and details of a single General Education (GE) category within a requirement for a term. Useful to confirm what a GE category prefix means (e.g. what 'HINQ' covers).",
  inputSchema: {
    termCode: termCodeSchema,
    geRequirementPrefix: stringField.describe(
      "GE requirement prefix from list_ge_requirements (e.g. 'ACORELIT').",
    ),
    geCategoryPrefix: stringField.describe(
      "GE category prefix from list_ge_requirements (e.g. 'HINQ').",
    ),
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const geRequirementPrefix =
      typeof args.geRequirementPrefix === "string" ? args.geRequirementPrefix.trim() : "";
    const geCategoryPrefix = typeof args.geCategoryPrefix === "string" ? args.geCategoryPrefix.trim() : "";
    if (geRequirementPrefix === "") throw new Error("geRequirementPrefix is required");
    if (geCategoryPrefix === "") throw new Error("geCategoryPrefix is required");

    const details = await get<GeCategoryDetails>("/Programs/GeCategoryDetails", {
      termCode,
      geRequirementPrefix,
      geCategoryPrefix,
    });
    return jsonResult(details);
  },
};