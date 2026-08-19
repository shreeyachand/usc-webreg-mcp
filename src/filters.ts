import type { Course, ScheduleEntry, Section } from "./types.js";

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface SectionFilters {
  days?: string[];
  startAfter?: string;
  startBefore?: string;
  openOnly?: boolean;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

function isValidDay(value: string): boolean {
  return (DAYS as readonly string[]).includes(value);
}

function timeAtLeast(entryTime: string, lower: string): boolean {
  return entryTime >= lower;
}

function timeAtMost(entryTime: string, upper: string): boolean {
  return entryTime <= upper;
}

export function entryMatchesFilters(entry: ScheduleEntry, filters: SectionFilters): boolean {
  if (filters.days && filters.days.length > 0) {
    for (const day of filters.days) {
      if (!entry.days.includes(day)) return false;
    }
  }
  if (filters.startAfter && !timeAtLeast(entry.startTime, filters.startAfter)) return false;
  if (filters.startBefore && !timeAtMost(entry.startTime, filters.startBefore)) return false;
  return true;
}

export function sectionMatchesFilters(section: Section, filters: SectionFilters): boolean {
  if (filters.openOnly) {
    if (section.isFull || section.isCancelled) return false;
  }
  return section.schedule.some((entry) => entryMatchesFilters(entry, filters));
}

/**
 * Filters a course's sections in place. Returns the course with only matching
 * sections, or null if the course has no matching sections.
 */
export function filterCourse(course: Course, filters: SectionFilters): Course | null {
  if (hasNoFilters(filters)) return course;
  const matching = course.sections.filter((section) => sectionMatchesFilters(section, filters));
  if (matching.length === 0) return null;
  return { ...course, sections: matching };
}

export function filterCourses(courses: Course[], filters: SectionFilters): Course[] {
  if (hasNoFilters(filters)) return courses;
  const result: Course[] = [];
  for (const course of courses) {
    const filtered = filterCourse(course, filters);
    if (filtered) result.push(filtered);
  }
  return result;
}

function hasNoFilters(filters: SectionFilters): boolean {
  return (
    !filters.openOnly &&
    (filters.days === undefined || filters.days.length === 0) &&
    filters.startAfter === undefined &&
    filters.startBefore === undefined
  );
}

export function normalizeFilters(raw: {
  days?: string[];
  startAfter?: string;
  startBefore?: string;
  openOnly?: boolean;
}): SectionFilters {
  const filters: SectionFilters = {};
  if (raw.days !== undefined) {
    if (!Array.isArray(raw.days) || raw.days.length === 0) {
      throw new Error("days must be a non-empty array of day abbreviations (Mon..Sun)");
    }
    for (const day of raw.days) {
      if (typeof day !== "string" || !isValidDay(day)) {
        throw new Error(
          `invalid day "${String(day)}": expected one of ${DAYS.join(", ")}`,
        );
      }
    }
    filters.days = raw.days;
  }
  if (raw.startAfter !== undefined) {
    if (typeof raw.startAfter !== "string" || !isValidTime(raw.startAfter)) {
      throw new Error('startAfter must be a zero-padded HH:MM time, e.g. "12:00"');
    }
    filters.startAfter = raw.startAfter;
  }
  if (raw.startBefore !== undefined) {
    if (typeof raw.startBefore !== "string" || !isValidTime(raw.startBefore)) {
      throw new Error('startBefore must be a zero-padded HH:MM time, e.g. "17:00"');
    }
    filters.startBefore = raw.startBefore;
  }
  if (raw.openOnly !== undefined) {
    filters.openOnly = Boolean(raw.openOnly);
  }
  return filters;
}