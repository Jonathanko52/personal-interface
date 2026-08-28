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
