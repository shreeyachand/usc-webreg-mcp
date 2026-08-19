import { z } from "zod";
import type { SectionFilters } from "./filters.js";
import { normalizeFilters } from "./filters.js";

export const termCodeSchema = z
  .union([
    z.string().regex(/^\d+$/, "termCode must be an integer like 20263"),
    z.number().int().positive(),
  ])
  .describe("Numeric USC term code, e.g. 20263 (Fall 2026). Use list_terms to discover codes.");

export const sectionFiltersShape = {
  days: z
    .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .optional()
    .describe(
      "Section must meet on all of the given days (e.g. ['Mon', 'Wed']). A section matches if any of its schedule entries covers every listed day.",
    ),
  startAfter: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be a zero-padded HH:MM time like 12:00")
    .optional()
    .describe("Only sections whose start time is at or after this zero-padded HH:MM time (e.g. '12:00')."),
  startBefore: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be a zero-padded HH:MM time like 17:00")
    .optional()
    .describe("Only sections whose start time is at or before this zero-padded HH:MM time (e.g. '17:00')."),
  openOnly: z
    .boolean()
    .optional()
    .describe("When true, only include sections that are not cancelled and not full (have seats available)."),
};

export interface FilterableArgs {
  days?: string[];
  startAfter?: string;
  startBefore?: string;
  openOnly?: boolean;
}

export function parseFilters(args: FilterableArgs): SectionFilters {
  return normalizeFilters({
    days: args.days,
    startAfter: args.startAfter,
    startBefore: args.startBefore,
    openOnly: args.openOnly,
  });
}

export function requireTermCode(raw: unknown): number {
  if (typeof raw !== "string" && typeof raw !== "number") {
    throw new Error("termCode is required and must be an integer, e.g. 20263");
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`invalid termCode "${raw}": expected an integer like 20263`);
  }
  return value;
}