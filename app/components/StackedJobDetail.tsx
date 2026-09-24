"use client";

import { useState } from "react";
import { StackedJob } from "@/app/lib/useJobStack";
import {
  APPLY_TYPE_LABELS,
  JOB_CATEGORIES,
  JOB_SOURCES,
  JOB_TYPE_LABELS,
  ApplyTypeCode,
  JobCategory,
  JobSource,
  JobTypeCode,
  toggleCategoryInArray,
} from "@/app/lib/jobFields";
import PillPicker from "./PillPicker";
import MultiPillPicker from "./MultiPillPicker";

interface StackedJobDetailProps {
  item: StackedJob;
  onSave: (patch: Partial<Omit<StackedJob, "id">>) => void;
  onClose: () => void;
}

const LABEL_CLASS = "text-xs font-semibold text-zinc-500 uppercase tracking-wider";
const INPUT_CLASS =
  "text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors";

function sameCategories(a: JobCategory[], b: JobCategory[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

export default function StackedJobDetail({ item, onSave, onClose }: StackedJobDetailProps) {
  const [companyName, setCompanyName] = useState(item.companyName);
  const [jobPosting, setJobPosting] = useState(item.jobPosting);
  const [location, setLocation] = useState(item.location);
  const [postingLink, setPostingLink] = useState(item.postingLink);
  const [source, setSource] = useState<JobSource>(item.source);
  const [applyType, setApplyType] = useState<ApplyTypeCode>(item.applyType);
  const [jobType, setJobType] = useState<JobTypeCode>(item.jobType);
  const [categories, setCategories] = useState<JobCategory[]>(item.categories);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isValid = Boolean(companyName.trim() && jobPosting.trim() && location.trim());

  const isDirty =
    companyName !== item.companyName ||
    jobPosting !== item.jobPosting ||
    location !== item.location ||
    postingLink !== item.postingLink ||
    source !== item.source ||
    applyType !== item.applyType ||
    jobType !== item.jobType ||
    !sameCategories(categories, item.categories);

  function commitChanges() {
    if (!isValid) return;
    onSave({
      companyName: companyName.trim(),
      jobPosting: jobPosting.trim(),
      location: location.trim(),
      postingLink: postingLink.trim(),
      source,
      applyType,
      jobType,
      categories,
    });
  }

  function attemptClose() {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }

  function handleSaveAndClose() {
    commitChanges();
    setShowConfirmClose(false);
    onClose();
  }

  function handleDiscardAndClose() {
    setShowConfirmClose(false);
    onClose();
  }

  return (
    <div
      className="min-h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) attemptClose();
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="flex-1 text-xl font-semibold text-zinc-700">Edit staged job</h1>
            <button
              onClick={commitChanges}
              disabled={!isDirty || !isValid}
              className="shrink-0 text-xs bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={attemptClose}
              className="shrink-0 text-zinc-400 hover:text-zinc-800 transition-colors text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>Role</label>
            <input
              type="text"
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL_CLASS}>Posting Link (optional)</label>
            <input
              type="url"
              value={postingLink}
              onChange={(e) => setPostingLink(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Source</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as JobSource)}
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
              onSelect={setApplyType}
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
              onSelect={setJobType}
              format={(type) => JOB_TYPE_LABELS[type]}
              theme="light"
              gap="sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Category</span>
            <MultiPillPicker
              options={JOB_CATEGORIES}
              selected={categories}
              onToggle={(category) => setCategories((prev) => toggleCategoryInArray(prev, category))}
              theme="light"
              gap="sm"
            />
          </div>
        </div>
      </div>

      {showConfirmClose && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowConfirmClose(false)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-4 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-zinc-700">You have unsaved changes. Save them before closing?</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-2 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscardAndClose}
                className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1.5"
              >
                Discard
              </button>
              <button
                onClick={handleSaveAndClose}
                disabled={!isValid}
                className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
