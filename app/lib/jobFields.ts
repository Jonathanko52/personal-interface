import categoryKeywords from "./categoryKeywords.json";

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

export const JOB_SOURCES = ["LinkedIn", "Indeed", "Other"] as const;
export type JobSource = (typeof JOB_SOURCES)[number];
export const DEFAULT_JOB_SOURCE: JobSource = "LinkedIn";

export function isJobSource(value: unknown): value is JobSource {
  return typeof value === "string" && (JOB_SOURCES as readonly string[]).includes(value);
}

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

export function toggleCategoryInArray(categories: JobCategory[], category: JobCategory): JobCategory[] {
  return categories.includes(category)
    ? categories.filter((c) => c !== category)
    : [...categories, category];
}

// Keyword lists live in categoryKeywords.json, hand-editable without touching code. "Other"
// has no keywords in that file, so it's never suggested — a catch-all, not a detectable term.
const CATEGORY_KEYWORDS = categoryKeywords as Record<JobCategory, string[]>;

export function suggestCategories(text: string): JobCategory[] {
  const lowerText = text.toLowerCase();
  return JOB_CATEGORIES.filter((category) =>
    CATEGORY_KEYWORDS[category].some((keyword) => lowerText.includes(keyword.toLowerCase()))
  );
}

const INTERNSHIP_PATTERN = /\bintern(ship)?\b/i;

export function suggestJobType(jobTitle: string): JobTypeCode {
  return INTERNSHIP_PATTERN.test(jobTitle) ? "internship" : "full-time";
}

export const MATCH_SCORE_MIN = 0;
export const MATCH_SCORE_MAX = 100;

export function isMatchScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MATCH_SCORE_MIN &&
    value <= MATCH_SCORE_MAX
  );
}

// Blank (or non-numeric) input means "no score"; anything else is rounded and clamped into range.
export function parseMatchScore(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return Math.min(MATCH_SCORE_MAX, Math.max(MATCH_SCORE_MIN, Math.round(n)));
}
