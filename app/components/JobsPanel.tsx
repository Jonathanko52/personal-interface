"use client";

import { useRef, useState } from "react";

interface JobResult {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
}

export default function JobsPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<JobResult | null>(null);
  const [applyType, setApplyType] = useState<"quick" | "normal">("normal");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);

  async function handleScrape() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApplyType("normal");
    setSaved(false);
    setConfirmDuplicate(false);
    setCheckFailed(false);
    try {
      const res = await fetch("/api/jobs/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: url.trim() }),
      });
      if (!res.ok) throw new Error(`Scrape failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveClick() {
    if (!result || savingRef.current) return;
    setError(null);
    setCheckFailed(false);
    setChecking(true);
    let checkOk = true;
    try {
      const res = await fetch(`/api/jobs/check?company=${encodeURIComponent(result.companyName)}`);
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
    if (!result || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setConfirmDuplicate(false);
    setError(null);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataOne: { ...result, applyType } }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaved(true);
      setUrl("");
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Something went wrong.") +
          " You can try saving again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Job Posting URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setResult(null);
            setApplyType("normal");
            setSaved(false);
            setConfirmDuplicate(false);
            setCheckFailed(false);
            setError(null);
          }}
          placeholder="Paste LinkedIn URL..."
          className="text-sm border border-zinc-200 text-zinc-400 rounded-md px-3 py-2 outline-none focus:border-indigo-400 transition-colors w-full"
        />
        <button
          onClick={handleScrape}
          disabled={!url.trim() || loading}
          className="text-sm bg-indigo-500 text-white rounded-md px-4 py-2 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {result && (
        <div className="flex flex-col gap-3 border border-slate-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Result</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div>
              <span className="text-slate-400 text-xs">Company</span>
              <p className="text-slate-100 font-medium">{result.companyName}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Role</span>
              <p className="text-slate-100">{result.jobPosting}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Location</span>
              <p className="text-slate-100">{result.location}</p>
            </div>
            <a
              href={result.postingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline text-xs truncate"
            >
              {result.postingLink}
            </a>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Apply Type</span>
            <div className="flex gap-1.5">
              {(["normal", "quick"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setApplyType(type)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    applyType === type
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "border-slate-600 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {type === "quick" ? "Quick Apply" : "Normal Apply"}
                </button>
              ))}
            </div>
          </div>
          {confirmDuplicate ? (
            <div className="flex flex-col gap-2 border border-yellow-600/40 bg-yellow-500/10 rounded-md p-3">
              <p className="text-xs text-yellow-200">
                You already submitted to {result.companyName} within the last week. Save anyway?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={doSave}
                  disabled={saving}
                  className="text-sm bg-indigo-500 text-white rounded-md px-3 py-1.5 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Yes, save anyway"}
                </button>
                <button
                  onClick={() => setConfirmDuplicate(false)}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  No, cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSaveClick}
              disabled={checking || saving || saved}
              className="text-sm bg-zinc-800 text-white rounded-md px-4 py-2 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {checking ? "Checking..." : saving ? "Saving..." : saved ? "Saved to Sheets ✓" : "Save to Sheets"}
            </button>
          )}
          {checkFailed && (
            <p className="text-xs text-yellow-500">
              Couldn&apos;t check for recent submissions to this company — saving anyway.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
