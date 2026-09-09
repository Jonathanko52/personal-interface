"use client";

import { useState } from "react";
import {
  ApplyTypeCode,
  JobTypeCode,
  JobCategory,
  APPLY_TYPE_LABELS,
  JOB_TYPE_LABELS,
  JOB_CATEGORIES,
} from "@/app/lib/jobFields";

export default function NewJobPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [location, setLocation] = useState("");
  const [postingLink, setPostingLink] = useState("");
  const [applyType, setApplyType] = useState<ApplyTypeCode>("normal");
  const [jobType, setJobType] = useState<JobTypeCode>("full-time");
  const [categories, setCategories] = useState<JobCategory[]>([]);

  const isValid = Boolean(companyName.trim() && jobPosting.trim() && location.trim());

  function toggleCategory(category: JobCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

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
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Apply Type</span>
          <div className="flex gap-1.5">
            {(["normal", "quick"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setApplyType(type)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  applyType === type
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {APPLY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Job Type</span>
          <div className="flex gap-1.5">
            {(["internship", "part-time", "full-time"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setJobType(type)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  jobType === type
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {JOB_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</span>
          <div className="flex gap-1.5 flex-wrap">
            {JOB_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  categories.includes(category)
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Save button built here for layout; the duplicate-check + save wiring is subtask 2. */}
        <button
          disabled={!isValid}
          className="self-start text-sm bg-zinc-800 text-white rounded-md px-4 py-2 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save to Sheets
        </button>
      </div>
    </div>
  );
}
