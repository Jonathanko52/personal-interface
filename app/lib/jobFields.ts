export const APPLY_TYPES = ["Quick Apply", "Normal Apply"] as const;
export type ApplyType = (typeof APPLY_TYPES)[number];

export const JOB_TYPES = ["Internship", "Part-time", "Full-time"] as const;
export type JobTypeLabel = (typeof JOB_TYPES)[number];

export function isApplyType(value: unknown): value is ApplyType {
  return typeof value === "string" && (APPLY_TYPES as readonly string[]).includes(value);
}

export function isJobTypeLabel(value: unknown): value is JobTypeLabel {
  return typeof value === "string" && (JOB_TYPES as readonly string[]).includes(value);
}

// Internal short-codes used by the pre-save scrape/edit UI (JobsPanel.tsx), distinct
// from the label strings above (which are what's actually stored/displayed post-save).
export type ApplyTypeCode = "quick" | "normal";
export const APPLY_TYPE_LABELS: Record<ApplyTypeCode, ApplyType> = {
  quick: "Quick Apply",
  normal: "Normal Apply",
};

export type JobTypeCode = "internship" | "part-time" | "full-time";
export const JOB_TYPE_LABELS: Record<JobTypeCode, JobTypeLabel> = {
  internship: "Internship",
  "part-time": "Part-time",
  "full-time": "Full-time",
};

export const JOB_CATEGORIES = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Data Science",
  "Machine Learning",
  "Translation",
  "Copywriting",
  "Other",
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export function isJobCategory(value: unknown): value is JobCategory {
  return typeof value === "string" && (JOB_CATEGORIES as readonly string[]).includes(value);
}
