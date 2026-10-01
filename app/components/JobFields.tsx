"use client";

import {
  APPLY_TYPE_LABELS,
  JOB_CATEGORIES,
  JOB_SOURCES,
  JOB_TYPE_LABELS,
  MATCH_SCORE_MIN,
  MATCH_SCORE_MAX,
  ApplyTypeCode,
  JobCategory,
  JobSource,
  JobTypeCode,
} from "@/app/lib/jobFields";
import PillPicker from "./PillPicker";
import MultiPillPicker from "./MultiPillPicker";

interface JobFieldsProps {
  source: JobSource;
  onSourceChange: (value: JobSource) => void;
  applyType: ApplyTypeCode;
  onApplyTypeChange: (value: ApplyTypeCode) => void;
  jobType: JobTypeCode;
  onJobTypeChange: (value: JobTypeCode) => void;
  matchScore: string;
  onMatchScoreChange: (value: string) => void;
  categories: JobCategory[];
  onToggleCategory: (category: JobCategory) => void;
}

export const LABEL_CLASS = "text-xs font-semibold text-zinc-500 uppercase tracking-wider";
export const INPUT_CLASS =
  "text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors";

// Source/Apply Type/Job Type/Match score/Category — the rest of the field block shared between
// `jobs/new/page.tsx`'s manual form and `StackedJobDetail.tsx` (Part 72). Company/Role/Location/
// Posting Link split out into JobIdentityFields.tsx (Part 74), so a caller's submit button can
// sit between the two groups. Light-themed only: both current callers are light, and no
// dark-themed caller shares this exact shape (JobsPanel.tsx is structurally different —
// disabled-on-saved inputs, a link instead of an editable Posting Link), so a theme prop would
// be unused indirection rather than real reuse.
export default function JobFields({
  source,
  onSourceChange,
  applyType,
  onApplyTypeChange,
  jobType,
  onJobTypeChange,
  matchScore,
  onMatchScoreChange,
  categories,
  onToggleCategory,
}: JobFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Source</span>
        <select
          value={source}
          onChange={(e) => onSourceChange(e.target.value as JobSource)}
          className={`${INPUT_CLASS} w-fit`}
        >
          {JOB_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Apply Type</span>
        <PillPicker
          options={["normal", "quick"] as const}
          selected={applyType}
          onSelect={onApplyTypeChange}
          format={(type) => APPLY_TYPE_LABELS[type]}
          theme="light"
          gap="sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Job Type</span>
        <PillPicker
          options={["internship", "part-time", "full-time"] as const}
          selected={jobType}
          onSelect={onJobTypeChange}
          format={(type) => JOB_TYPE_LABELS[type]}
          theme="light"
          gap="sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Match score (optional)</span>
        <input
          type="number"
          min={MATCH_SCORE_MIN}
          max={MATCH_SCORE_MAX}
          step={1}
          value={matchScore}
          onChange={(e) => onMatchScoreChange(e.target.value)}
          placeholder={`${MATCH_SCORE_MIN}–${MATCH_SCORE_MAX}`}
          className={`${INPUT_CLASS} w-28`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Category</span>
        <MultiPillPicker
          options={JOB_CATEGORIES}
          selected={categories}
          onToggle={onToggleCategory}
          theme="light"
          gap="sm"
        />
      </div>
    </div>
  );
}
