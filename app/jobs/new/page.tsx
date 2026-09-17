"use client";

import { useState } from "react";
import {
  ApplyTypeCode,
  JobTypeCode,
  JobCategory,
  JobSource,
  APPLY_TYPE_LABELS,
  JOB_TYPE_LABELS,
  JOB_CATEGORIES,
  JOB_SOURCES,
  DEFAULT_JOB_SOURCE,
  toggleCategoryInArray,
} from "@/app/lib/jobFields";
import { incrementJobCount } from "@/app/lib/jobCounts";
import { useJobSaveFlow } from "@/app/lib/useJobSaveFlow";
import PillPicker from "@/app/components/PillPicker";
import MultiPillPicker from "@/app/components/MultiPillPicker";

export default function NewJobPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [location, setLocation] = useState("");
  const [postingLink, setPostingLink] = useState("");
  const [applyType, setApplyType] = useState<ApplyTypeCode>("normal");
  const [jobType, setJobType] = useState<JobTypeCode>("full-time");
  const [source, setSource] = useState<JobSource>(DEFAULT_JOB_SOURCE);
  const [categories, setCategories] = useState<JobCategory[]>([]);

  const isValid = Boolean(companyName.trim() && jobPosting.trim() && location.trim());

  function toggleCategory(category: JobCategory) {
    setCategories((prev) => toggleCategoryInArray(prev, category));
  }

  const {
    checking,
    saving,
    saved,
    setSaved,
    confirmDuplicate,
    setConfirmDuplicate,
    checkFailed,
    error,
    handleSaveClick,
    doSave,
  } = useJobSaveFlow({
    isValid,
    getCompanyName: () => companyName,
    buildPayload: () => ({
      companyName: companyName.trim(),
      jobPosting: jobPosting.trim(),
      location: location.trim(),
      postingLink: postingLink.trim(),
      applyType,
      jobType,
      source,
      categories,
    }),
    onSaved: () => {
      incrementJobCount(applyType);
      setTimeout(() => {
        setCompanyName("");
        setJobPosting("");
        setLocation("");
        setPostingLink("");
        setApplyType("normal");
        setJobType("full-time");
        setSource(DEFAULT_JOB_SOURCE);
        setCategories([]);
        setSaved(false);
      }, 5000);
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Add job entry manually</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-900 bg-white focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</label>
          <input
            type="text"
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-900 bg-white focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-900 bg-white focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Posting Link (optional)
          </label>
          <input
            type="url"
            value={postingLink}
            onChange={(e) => setPostingLink(e.target.value)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-900 bg-white focus:border-indigo-400 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as JobSource)}
            className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-900 bg-white focus:border-indigo-400 transition-colors w-fit"
          >
            {JOB_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Apply Type</span>
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
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Job Type</span>
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
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</span>
          <MultiPillPicker
            options={JOB_CATEGORIES}
            selected={categories}
            onToggle={toggleCategory}
            theme="light"
            gap="sm"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {confirmDuplicate ? (
          <div className="flex flex-col gap-2 border border-yellow-400 bg-yellow-50 rounded-md p-3">
            <p className="text-xs text-yellow-800">
              You already submitted to {companyName} within the last week. Save anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={doSave}
                disabled={saving || !isValid}
                className="text-sm bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Yes, save anyway"}
              </button>
              <button
                onClick={() => setConfirmDuplicate(false)}
                className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                No, cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSaveClick}
            disabled={checking || saving || saved || !isValid}
            className="self-start text-sm bg-zinc-800 text-white rounded-md px-4 py-2 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {checking ? "Checking..." : saving ? "Saving..." : saved ? "Saved to Sheets ✓" : "Save to Sheets"}
          </button>
        )}
        {checkFailed && (
          <p className="text-xs text-yellow-600">
            Couldn&apos;t check for recent submissions to this company — saving anyway.
          </p>
        )}
      </div>
    </div>
  );
}
