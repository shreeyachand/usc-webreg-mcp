export interface TermCode {
  value: number;
  year: number;
  term: number;
  season: string;
}

export interface TermInfo {
  seasonName: string;
  status: string;
  dateActive: string;
  dateCreated: string;
  dateModified: string;
  term: TermCode;
  termCode: number;
  season: string;
  year: number;
}

export interface School {
  programs: Program[] | null;
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface Program {
  schools: School[] | null;
  courses: unknown;
  programNote: string | null;
  departmentClearances: unknown;
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface CourseCode {
  prefix: string;
  number: string;
  suffix: string;
  courseHyphen: string;
  courseSpace: string;
  courseSmashed: string;
}

export interface Instructor {
  firstName: string;
  lastName: string;
}

export interface ScheduleEntry {
  dayCode: string;
  days: string[];
  startTime: string;
  endTime: string;
  sectionLocationSqNumber?: number;
}

export interface SectionSession {
  termCode: string;
  rnrSessionCode: string;
  description: string | null;
  rnrSessionId: number;
}

export interface Section {
  sisSectionId: string;
  linkCode: string;
  linkCodeForSort: string;
  rnrSessionId: number;
  peSectionId: number;
  courseId: number;
  hasDClearance: boolean;
  classType: string | null;
  name: string | null;
  notes: string | null;
  description: string | null;
  group: string | null;
  schedule: ScheduleEntry[];
  totalSeats: number;
  registeredSeats: number;
  waitlistedSeats: number | null;
  rnrMode: string | null;
  session: SectionSession;
  units: string[];
  instructors: Instructor[];
  syllabus: string | null;
  isCancelled: boolean;
  isFull: boolean;
  rnrModeCode: string;
  term: TermCode;
  termCode: number;
  season: string;
  year: number;
}

export interface Course {
  courseId: number;
  startTermCode: number;
  endTermCode: number | null;
  classNumber: string;
  sequence: string | null;
  suffix: string | null;
  description: string | null;
  fullCourseName: string;
  isCrossListed: boolean;
  maxUnits: string | null;
  courseNotes: string | null;
  termNotes: string | null;
  duplicateCredit: string | null;
  recommendedPrep: string | null;
  geCode: string | null;
  scheduledCourseCode: CourseCode | null;
  publishedCourseCode: CourseCode | null;
  matchedCourseCode: CourseCode | null;
  courseUnits: number[] | string[];
  sections: Section[];
  prerequisiteCourseCodes: unknown[];
  corequisiteCourseCodes: unknown[];
  courseRestrictions: unknown[];
  majorRestrictions: unknown[];
  schoolRestrictions: unknown[];
  concurrentCourses: unknown[];
  remainingSectionSeats: number;
  sectionSeatCount: number;
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface SearchResult {
  termCode: number;
  courseCount: number;
  searchQuery: string | null;
  courses: Course[];
  programs: unknown;
}

export interface CoursePrefix {
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface GeCategory {
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface GeRequirement {
  name: string;
  id: number;
  prefix: string;
  categories: GeCategory[];
  sortOrder: number;
}

export interface GeGroup {
  groupType: string;
  requirements: GeRequirement[];
}

export interface GeSummary {
  termCode: number;
  geGroups: GeGroup[];
}

export interface GeCoursesResult {
  geRequirementPrefix: string;
  geCategoryPrefix: string;
  termCode: number;
  courses: Course[];
}

export interface GeCategoryDetails {
  programNote: string | null;
  geRequirementPrefix: string;
  termCode: number;
  prefix: string;
  name: string;
  sortOrder: number;
}

export interface Session {
  sections: unknown;
  sectionWrs: unknown;
  termCode: string;
  rnrSessionCode: string;
  description: string | null;
  lastDropDateDbDate: string;
  lastDropDate: string;
  rnrSessionId: number;
  sisSessionId: string;
  gradingCycleCode: string | null;
  [key: string]: unknown;
}

export interface SectionFees {
  sectionId: string;
  fees: unknown[];
}