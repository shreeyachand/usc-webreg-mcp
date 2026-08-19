import { z } from "zod";
import { get } from "../api.js";
import type { CoursePrefix, Program, School, SectionFees, Session } from "../types.js";
import { jsonResult, requiredString, type ToolDefinition } from "../tool.js";
import { requireTermCode, termCodeSchema } from "../helpers.js";

const stringField = z.string().min(1);

export const listSchoolsTool: ToolDefinition = {
  name: "list_schools",
  description:
    "List all USC schools/colleges offering classes in a term, each with its prefix (e.g. 'ENGV' = Viterbi, 'DRNS' = Dornsife) and the programs (departments) it contains. Useful for navigating the catalog structure.",
  inputSchema: {
    termCode: termCodeSchema,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const schools = await get<School[]>("/Schools/TermCode", { termCode });
    const summary = schools.map((s) => ({
      prefix: s.prefix,
      name: s.name,
      programs: (s.programs ?? []).map((p) => ({ prefix: p.prefix, name: p.name })),
    }));
    return jsonResult(summary);
  },
};

export const listProgramsTool: ToolDefinition = {
  name: "list_programs",
  description:
    "List all USC programs (departments/majors) in a term, each with its prefix, name, and the school prefix(es) it belongs to. Use this to find the school+program pair needed for list_courses_by_program (e.g. Computer Science is program 'CSCI' under school 'ENGV').",
  inputSchema: {
    termCode: termCodeSchema,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const programs = await get<Program[]>("/Programs/TermCode", { termCode });
    const summary = programs.map((p) => ({
      prefix: p.prefix,
      name: p.name,
      schools: (p.schools ?? []).map((s) => ({ prefix: s.prefix, name: s.name })),
      programNote: p.programNote,
    }));
    return jsonResult(summary);
  },
};

export const getProgramTool: ToolDefinition = {
  name: "get_program",
  description:
    "Get details for a single USC program in a term, including program-specific notes (e.g. enrollment or D-clearance instructions). Requires the program's school prefix (find via list_programs) and the program prefix.",
  inputSchema: {
    termCode: termCodeSchema,
    school: stringField.describe("School prefix the program belongs to (e.g. 'ENGV')."),
    program: stringField.describe("Program/department prefix (e.g. 'CSCI')."),
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const school = requiredString(args, "school");
    const program = requiredString(args, "program");
    const details = await get<Program | null>("/Programs/Prefix", { termCode, school, program }, {
      allowEmpty: true,
    });
    if (details === null || (Array.isArray(details) && details.length === 0) || Object.keys(details).length === 0) {
      return jsonResult({
        note: `No program found for school "${school}" / program "${program}". Verify prefixes with list_programs.`,
      });
    }
    return jsonResult(details);
  },
};

export const listCoursePrefixesTool: ToolDefinition = {
  name: "list_course_prefixes",
  description:
    "List every USC subject prefix in the catalog (e.g. CSCI, MATH, AHIS) across all terms, with its name. Useful for discovering what subjects exist.",
  inputSchema: {},
  handler: async () => {
    const prefixes = await get<CoursePrefix[]>("/Pe/CoursePrefixesAll");
    return jsonResult(prefixes);
  },
};

export const checkCourseExistsTool: ToolDefinition = {
  name: "check_course_exists",
  description:
    "Check whether a course code exists anywhere in the USC catalog (not limited to a single term). Accepts codes like 'CSCI-103'. Returns true/false.",
  inputSchema: {
    course: stringField.describe("Course code to check, e.g. 'CSCI-103'."),
  },
  handler: async (args) => {
    const course = requiredString(args, "course");
    const exists = await get<boolean>("/Pe/DoesCourseExist", { course });
    return jsonResult({ course, exists });
  },
};

export const listSessionsTool: ToolDefinition = {
  name: "list_sessions",
  description:
    "List USC enrollment sessions (e.g. regular session '001', summer sessions) with their term, session code, description, last drop date, and RNR session id. Useful for understanding session codes shown on sections.",
  inputSchema: {},
  handler: async () => {
    const sessions = await get<Session[]>("/Pe/SessionsAll");
    const summary = sessions.map((s) => ({
      termCode: s.termCode,
      rnrSessionCode: s.rnrSessionCode,
      rnrSessionId: s.rnrSessionId,
      sisSessionId: s.sisSessionId,
      description: s.description,
      lastDropDate: s.lastDropDate,
    }));
    return jsonResult(summary);
  },
};

export const getSectionFeesTool: ToolDefinition = {
  name: "get_section_fees",
  description:
    "Get the fees for a single course section by its SIS section id (the 'sisSectionId' field on a section, e.g. '29934'). Returns any tuition/fee items attached to the section.",
  inputSchema: {
    sectionId: stringField.describe("SIS section id from a section's 'sisSectionId' field."),
  },
  handler: async (args) => {
    const sectionId = requiredString(args, "sectionId");
    const fees = await get<SectionFees>("/Pe/SectionFees", { sectionId });
    return jsonResult(fees);
  },
};

export const getSyllabusIndexTool: ToolDefinition = {
  name: "get_syllabus_index",
  description:
    "Get the SimpleSyllabus index URL for a term, which can be used to look up published syllabi for that term's sections. Individual sections also carry a 'syllabus' URL directly.",
  inputSchema: {
    termCode: termCodeSchema,
  },
  handler: async (args) => {
    const termCode = requireTermCode(args.termCode);
    const url = await get<string>("/SimpleSyllabus/LookupUrlByTermCode", { termCode });
    return jsonResult({ termCode, syllabusUrl: url });
  },
};