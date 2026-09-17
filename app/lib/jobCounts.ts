import { ApplyTypeCode } from "./jobFields";

export interface JobCounts {
  total: number;
  quickApply: number;
  normalApply: number;
}

const JOB_COUNTS_KEY = "jobCounts";
const EMPTY_COUNTS: JobCounts = { total: 0, quickApply: 0, normalApply: 0 };

// The native "storage" event only fires in *other* tabs/windows, never in the same tab
// that made the change — no good for keeping JobsPanel.tsx and app/jobs/new/page.tsx in
// sync when both are mounted in the same page. This custom event covers that instead.
export const JOB_COUNTS_CHANGED_EVENT = "jobcounts-changed";

function isJobCounts(value: unknown): value is JobCounts {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.total === "number" && typeof v.quickApply === "number" && typeof v.normalApply === "number";
}

export function getJobCounts(): JobCounts {
  try {
    const raw = localStorage.getItem(JOB_COUNTS_KEY);
    if (!raw) return EMPTY_COUNTS;
    const parsed = JSON.parse(raw);
    return isJobCounts(parsed) ? parsed : EMPTY_COUNTS;
  } catch {
    return EMPTY_COUNTS;
  }
}

function saveJobCounts(counts: JobCounts) {
  try {
    localStorage.setItem(JOB_COUNTS_KEY, JSON.stringify(counts));
    window.dispatchEvent(new CustomEvent(JOB_COUNTS_CHANGED_EVENT));
  } catch {}
}

export function resetJobCounts(): JobCounts {
  saveJobCounts(EMPTY_COUNTS);
  return EMPTY_COUNTS;
}

export function incrementJobCount(applyType: ApplyTypeCode): JobCounts {
  const current = getJobCounts();
  const next: JobCounts = {
    total: current.total + 1,
    quickApply: current.quickApply + (applyType === "quick" ? 1 : 0),
    normalApply: current.normalApply + (applyType === "normal" ? 1 : 0),
  };
  saveJobCounts(next);
  return next;
}
