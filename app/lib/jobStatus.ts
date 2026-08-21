export const JOB_STATUSES = ["Applied", "Interviewing", "Offer", "Rejected"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
export const DEFAULT_JOB_STATUS: JobStatus = "Applied";

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && (JOB_STATUSES as readonly string[]).includes(value);
}
