"use client";

import { useState } from "react";

interface JobResult {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
}

export default function JobsPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScrape() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
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

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataOne: result }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
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
            setSaved(false);
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
        <div className="flex flex-col gap-3 border border-zinc-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Result</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div>
              <span className="text-zinc-400 text-xs">Company</span>
              <p className="text-zinc-800 font-medium">{result.companyName}</p>
            </div>
            <div>
              <span className="text-zinc-400 text-xs">Role</span>
              <p className="text-zinc-800">{result.jobPosting}</p>
            </div>
            <div>
              <span className="text-zinc-400 text-xs">Location</span>
              <p className="text-zinc-800">{result.location}</p>
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
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="text-sm bg-zinc-800 text-white rounded-md px-4 py-2 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : saved ? "Saved to Sheets ✓" : "Save to Sheets"}
          </button>
        </div>
      )}
    </div>
  );
}
