// Single source of truth for the Jobs Sheet's column layout. Every route that reads or writes
// the Sheet derives its ranges and row indices from here, so adding a column is one edit.
export const JOB_SHEET = "Jobs";

export const JOB_COLUMNS = {
  source: "A",
  company: "B",
  role: "C",
  dateApplied: "D",
  location: "E",
  postingLink: "F",
  applyType: "G",
  jobType: "H",
  status: "I",
  categories: "J",
  matchScore: "K",
} as const;
export type JobColumnField = keyof typeof JOB_COLUMNS;

// Derived rather than hardcoded, so adding a column above can't leave the write range stale.
export const JOB_LAST_COLUMN: string = Object.values(JOB_COLUMNS).sort().at(-1)!;

// 0-based index into a row array returned by values.get (single-letter columns only).
export function colIndex(field: JobColumnField): number {
  return JOB_COLUMNS[field].charCodeAt(0) - "A".charCodeAt(0);
}
