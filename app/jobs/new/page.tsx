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
  suggestCategories,
  suggestJobType,
} from "@/app/lib/jobFields";
import { useJobCounts } from "@/app/lib/useJobCounts";
import { useJobStack } from "@/app/lib/useJobStack";
import { checkDuplicate, saveJob } from "@/app/lib/jobSave";
import PillPicker from "@/app/components/PillPicker";
import MultiPillPicker from "@/app/components/MultiPillPicker";
import StackedJobRow from "@/app/components/StackedJobRow";

export default function NewJobPage() {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [jobPosting, setJobPosting] = useState("");
  const [location, setLocation] = useState("");
  const [postingLink, setPostingLink] = useState("");
  const [applyType, setApplyType] = useState<ApplyTypeCode>("normal");
  const [jobType, setJobType] = useState<JobTypeCode>("full-time");
  const [source, setSource] = useState<JobSource>(DEFAULT_JOB_SOURCE);
  const [categories, setCategories] = useState<JobCategory[]>([]);

  const { counts, increment, reset } = useJobCounts();
  const { stack, addToStack, removeFromStack, clearStack } = useJobStack();
  const [savingAll, setSavingAll] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const isValid = Boolean(companyName.trim() && jobPosting.trim() && location.trim());

  function toggleCategory(category: JobCategory) {
    setCategories((prev) => toggleCategoryInArray(prev, category));
  }

  function resetForm() {
    setCompanyName("");
    setJobPosting("");
    setLocation("");
    setPostingLink("");
    setApplyType("normal");
    setJobType("full-time");
    setSource(DEFAULT_JOB_SOURCE);
    setCategories([]);
    setUrl("");
  }

  async function handleScrape() {
    if (!url.trim()) return;
    setScraping(true);
    setScrapeError(null);
    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Scrape failed (${res.status})`);
      setCompanyName(data.companyName ?? "");
      setJobPosting(data.jobPosting ?? "");
      setLocation(data.location ?? "");
      setPostingLink(data.postingLink ?? "");
      setCategories(suggestCategories(`${data.jobPosting ?? ""} ${data.description ?? ""}`));
      setJobType(suggestJobType(data.jobPosting ?? ""));
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setScraping(false);
    }
  }

  function handleEditStackItem(id: string) {
    const item = stack.find((s) => s.id === id);
    if (!item) return;
    setCompanyName(item.companyName);
    setJobPosting(item.jobPosting);
    setLocation(item.location);
    setPostingLink(item.postingLink);
    setApplyType(item.applyType);
    setJobType(item.jobType);
    setSource(item.source);
    setCategories(item.categories);
    removeFromStack(id);
  }

  function handleAddToStack() {
    if (!isValid) return;
    addToStack({
      companyName: companyName.trim(),
      jobPosting: jobPosting.trim(),
      location: location.trim(),
      postingLink: postingLink.trim(),
      applyType,
      jobType,
      source,
      categories,
    });
    resetForm();
  }

  // Sequential batch loop, not per-row useJobSaveFlow instances: that hook's check->save
  // sequence pauses on a duplicate for a human decision, which doesn't fit a headless batch —
  // this loop instead skips a flagged item and lets it be resolved individually below.
  // Shares its actual network calls with useJobSaveFlow via app/lib/jobSave.ts (Part 59
  // subtask 3), rather than duplicating the fetch logic.
  async function handleSaveAll() {
    setSavingAll(true);
    const skipped = new Set<string>();
    for (const item of stack) {
      const { duplicate } = await checkDuplicate(item.companyName);
      if (duplicate) {
        skipped.add(item.id);
        continue;
      }
      const result = await saveJob({
        companyName: item.companyName,
        jobPosting: item.jobPosting,
        location: item.location,
        postingLink: item.postingLink,
        applyType: item.applyType,
        jobType: item.jobType,
        source: item.source,
        categories: item.categories,
      });
      if (!result.ok) {
        skipped.add(item.id);
        continue;
      }
      removeFromStack(item.id);
      increment(item.applyType);
    }
    setSkippedIds(skipped);
    setSavingAll(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-700 mb-4">Add a job</h1>

      <div className="flex items-center gap-4 text-xs text-zinc-500 border-b border-zinc-200 pb-3 mb-6">
        <span>Count: <span className="text-zinc-700 font-medium">{counts?.total ?? "—"}</span></span>
        <span>Quick: <span className="text-zinc-700 font-medium">{counts?.quickApply ?? "—"}</span></span>
        <span>Normal: <span className="text-zinc-700 font-medium">{counts?.normalApply ?? "—"}</span></span>
        <button
          onClick={reset}
          className="ml-auto text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Scrape a URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste LinkedIn URL..."
                className="flex-1 text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors"
              />
              <button
                onClick={handleScrape}
                disabled={!url.trim() || scraping}
                className="text-sm bg-indigo-500 text-white rounded-md px-4 py-2 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scraping ? "Scraping..." : "Scrape"}
              </button>
            </div>
            {scrapeError && <p className="text-xs text-red-500">{scrapeError}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors"
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
                className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as JobSource)}
                className="text-sm border border-zinc-200 rounded-md px-3 py-2 outline-none text-zinc-700 bg-white focus:border-indigo-400 transition-colors w-fit"
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

            <button
              onClick={handleAddToStack}
              disabled={!isValid}
              className="self-start text-sm bg-zinc-800 text-white rounded-md px-4 py-2 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to stack
            </button>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-3 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Stack ({stack.length})
            </h2>
            {stack.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAll}
                  disabled={savingAll}
                  className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40"
                >
                  {savingAll ? "Saving all..." : "Save all"}
                </button>
                <button
                  onClick={clearStack}
                  disabled={savingAll}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          {stack.length > 0 ? (
            <div className="flex flex-col gap-2">
              {stack.map((item) => (
                <StackedJobRow
                  key={item.id}
                  item={item}
                  skipped={skippedIds.has(item.id)}
                  onRemove={() => removeFromStack(item.id)}
                  onEdit={() => handleEditStackItem(item.id)}
                  onSaved={() => {
                    removeFromStack(item.id);
                    increment(item.applyType);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-md p-3">
              Nothing staged yet — scrape a URL or fill out the form and add it to the stack.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
