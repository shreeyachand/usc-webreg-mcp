import type {
  Course,
  GeCategoryDetails,
  GeRequirement,
  GeSummary,
  Program,
  Section,
  TermInfo,
} from "./types.js";

function omitNullish<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

export function compactScheduleEntry(e: { days: string[]; startTime: string; endTime: string }) {
  return { days: e.days, start: e.startTime, end: e.endTime };
}

export function compactSection(s: Section) {
  return omitNullish({
    sectionId: s.sisSectionId,
    linkCode: s.linkCode,
    type: s.rnrMode,
    schedule: s.schedule.map((e) => compactScheduleEntry(e)),
    seats: omitNullish({ total: s.totalSeats, registered: s.registeredSeats, waitlisted: s.waitlistedSeats }),
    units: s.units,
    instructors: s.instructors.map((i) => `${i.firstName} ${i.lastName}`.trim()),
    syllabus: s.syllabus,
    cancelled: s.isCancelled || undefined,
    full: s.isFull || undefined,
    hasDClearance: s.hasDClearance || undefined,
    session: s.session?.rnrSessionCode,
    notes: s.notes,
    description: s.description,
  });
}

export function compactCourse(c: Course) {
  return omitNullish({
    course: c.fullCourseName,
    title: c.name,
    description: c.description,
    units: c.courseUnits,
    geCode: c.geCode,
    recommendedPrep: c.recommendedPrep,
    courseNotes: c.courseNotes,
    termNotes: c.termNotes,
    duplicateCredit: c.duplicateCredit,
    prerequisites: c.prerequisiteCourseCodes,
    corequisites: c.corequisiteCourseCodes,
    restrictions: c.courseRestrictions,
    majorRestrictions: c.majorRestrictions,
    schoolRestrictions: c.schoolRestrictions,
    concurrentCourses: c.concurrentCourses,
    sections: c.sections.map(compactSection),
  });
}

export function compactTerm(t: TermInfo) {
  return {
    termCode: t.termCode,
    season: t.season,
    year: t.year,
    status: t.status,
    dateActive: t.dateActive,
  };
}

export function compactProgram(p: Program) {
  return omitNullish({
    prefix: p.prefix,
    name: p.name,
    schools: (p.schools ?? []).map((s) => ({ prefix: s.prefix, name: s.name })),
    programNote: p.programNote,
  });
}

export function compactGeRequirement(r: GeRequirement) {
  return {
    name: r.name,
    prefix: r.prefix,
    categories: r.categories.map((c) => ({ prefix: c.prefix, name: c.name })),
  };
}

export function compactGeSummary(g: GeSummary) {
  return {
    termCode: g.termCode,
    geGroups: g.geGroups.map((grp) => ({
      groupType: grp.groupType,
      requirements: grp.requirements.map(compactGeRequirement),
    })),
  };
}

export function compactGeCategoryDetails(d: GeCategoryDetails) {
  return omitNullish({
    prefix: d.prefix,
    name: d.name,
    geRequirementPrefix: d.geRequirementPrefix,
    programNote: d.programNote,
  });
}
