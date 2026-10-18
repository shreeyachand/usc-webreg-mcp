import { z } from "zod";
import { get } from "../api.js";
import type { Course, SearchResult } from "../types.js";
import { jsonResult, readOnlyAnnotations, type ToolDefinition } from "../tool.js";
import { requireTermCode, termCodeSchema, parseFilters, sectionFiltersShape } from "../helpers.js";
import { filterCourse, filterCourses } from "../filters.js";
import type { SectionFilters } from "../filters.js";
import { compactCourse } from "../compact.js";

function filtersFromArgs(args: Record<string, unknown>): SectionFilters {
  return parseFilters({
    days: args.days as string[] | undefined,
    startAfter: args.startAfter as string | undefined,
    startBefore: args.startBefore as string | undefined,
    openOnly: args.openOnly as boolean | undefined,
  });
}

const stringField = z.string().min(1);

export const searchCoursesTool: ToolDefinition = {
  name: "search_courses",
  description:
    "Search the USC course catalog for a term by keyword. Matches course codes, titles, and descriptions (e.g. 'machine learning', 'CSCI', 'art history'). Returns matching courses with their sections, including schedule, instructor, and seat availability. Supports optional section filters (days, startAfter, startBefore, openOnly) applied client-side.",
  inputSchema: {
    termCode: termCodeSchema,
    searchTerm: stringField,
    ...sectionFiltersShape,
  },
  annotations: readOnlyAnnotations,
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const searchTerm = typeof args.searchTerm === "string" ? args.searchTerm.trim() : "";
    if (searchTerm === "") throw new Error("searchTerm is required");

    const result = await get<SearchResult>("/Search/Basic", { termCode, searchTerm });
    const filters = filtersFromArgs(args);
    const courses = filterCourses(result.courses ?? [], filters);
    return jsonResult({
      termCode,
      searchQuery: result.searchQuery,
      courseCount: courses.length,
      courses: courses.map(compactCourse),
    });
  },
};

export const getCourseTool: ToolDefinition = {
  name: "get_course",
  description:
    "Get the full record for a single USC course in a term by its course code (e.g. 'CSCI-103'). Includes description, units, GE code, prerequisites, corequisites, restrictions, and all sections with schedule, instructor, seats, fees, and syllabus URL. Supports optional section filters (days, startAfter, startBefore, openOnly) applied client-side.",
  inputSchema: {
    termCode: termCodeSchema,
    courseCode: stringField,
    ...sectionFiltersShape,
  },
  annotations: readOnlyAnnotations,
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const courseCode = typeof args.courseCode === "string" ? args.courseCode.trim() : "";
    if (courseCode === "") throw new Error("courseCode is required");

    const course = await get<Course>("/Courses/Course", { termCode, courseCode });
    const filters = filtersFromArgs(args);
    const filtered = filterCourse(course, filters);
    if (filtered === null) {
      return jsonResult({
        course: course.fullCourseName,
        message: "No sections match the provided filters.",
      });
    }
    return jsonResult(compactCourse(filtered));
  },
};

export const listCoursesByProgramTool: ToolDefinition = {
  name: "list_courses_by_program",
  description:
    "List all courses offered by a USC program (department) in a term. Requires the school prefix and program prefix, which can be discovered via list_programs. For example, Computer Science is school 'ENGV' and program 'CSCI'. Returns courses with their sections. Supports optional section filters (days, startAfter, startBefore, openOnly) applied client-side.",
  inputSchema: {
    termCode: termCodeSchema,
    school: stringField.describe("School prefix the program belongs to (e.g. 'ENGV' for Viterbi). Find via list_programs."),
    program: stringField.describe("Program/department prefix (e.g. 'CSCI' for Computer Science)."),
    ...sectionFiltersShape,
  },
  annotations: readOnlyAnnotations,
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const school = typeof args.school === "string" ? args.school.trim() : "";
    const program = typeof args.program === "string" ? args.program.trim() : "";
    if (program === "") throw new Error("program is required");

    const result = await get<{
      schoolPrefix: string | null;
      programPrefix: string | null;
      gePrefix: string | null;
      termCode: number;
      courses: Course[] | null;
    }>("/Courses/CoursesByTermSchoolProgram", { termCode, school, program });

    if (result.courses === null) {
      return jsonResult({
        termCode,
        school,
        program,
        courses: [],
        note: `No course list found for school "${school}" / program "${program}". Verify the school prefix with list_programs (programs list their school in the 'schools' field).`,
      });
    }

    const filters = filtersFromArgs(args);
    const courses = filterCourses(result.courses, filters);
    return jsonResult({ termCode, school: result.schoolPrefix, program: result.programPrefix, courses: courses.map(compactCourse) });
  },
};