"use client";

import { useRef, useState } from "react";
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
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const isValid = Boolean(companyName.trim() && jobPosting.trim() && location.trim());

  function toggleCategory(category: JobCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  async function handleSaveClick() {
    if (!isValid || savingRef.current) return;
    setError(null);
    setCheckFailed(false);
    setChecking(true);
    let checkOk = true;
    try {
      const res = await fetch(`/api/jobs/check?company=${encodeURIComponent(companyName)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        checkOk = false;
      } else if (data.duplicate) {
        setChecking(false);
        setConfirmDuplicate(true);
        return;
      }
    } catch {
      checkOk = false;
    } finally {
      setChecking(false);
    }
    // If the duplicate check itself fails, don't block saving on it — just surface that it didn't run.
    if (!checkOk) setCheckFailed(true);
    await doSave();
  }

  async function doSave() {
    if (!isValid || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setConfirmDuplicate(false);
    setError(null);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataOne: {
            companyName: companyName.trim(),
            jobPosting: jobPosting.trim(),
            location: location.trim(),
            postingLink: postingLink.trim(),
            applyType,
            jobType,
            categories,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      setSaved(true);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Something went wrong.") + " You can try saving again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
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
