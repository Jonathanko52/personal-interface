"use client";

import { useState } from "react";
import { StackedJob } from "@/app/lib/useJobStack";
import {
  ApplyTypeCode,
  JobCategory,
  JobSource,
  JobTypeCode,
  parseMatchScore,
  toggleCategoryInArray,
} from "@/app/lib/jobFields";
import JobFields from "./JobFields";
import ConfirmDialog from "./ConfirmDialog";

interface StackedJobDetailProps {
  item: StackedJob;
  onSave: (patch: Partial<Omit<StackedJob, "id">>) => void;
  onClose: () => void;
}

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
  const [matchScore, setMatchScore] = useState(item.matchScore === null ? "" : String(item.matchScore));
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
    !sameCategories(categories, item.categories) ||
    parseMatchScore(matchScore) !== item.matchScore;

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
      matchScore: parseMatchScore(matchScore),
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

          <JobFields
            companyName={companyName}
            onCompanyNameChange={setCompanyName}
            jobPosting={jobPosting}
            onJobPostingChange={setJobPosting}
            location={location}
            onLocationChange={setLocation}
            postingLink={postingLink}
            onPostingLinkChange={setPostingLink}
            source={source}
            onSourceChange={setSource}
            applyType={applyType}
            onApplyTypeChange={setApplyType}
            jobType={jobType}
            onJobTypeChange={setJobType}
            matchScore={matchScore}
            onMatchScoreChange={setMatchScore}
            categories={categories}
            onToggleCategory={(category) => setCategories((prev) => toggleCategoryInArray(prev, category))}
          />
        </div>
      </div>

      {showConfirmClose && (
        <ConfirmDialog theme="light" onDismiss={() => setShowConfirmClose(false)}>
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
        </ConfirmDialog>
      )}
    </div>
  );
}
