"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/lib/DataContext";
import { completionCounts } from "@/app/lib/completionStats";

interface JobCounts {
  total: number;
  quickApply: number;
  normalApply: number;
}

export default function MetricsPage() {
  const { completions } = useData();
  const todoCounts = completionCounts(completions);
  const [counts, setCounts] = useState<JobCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCounts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/count");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setCounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCounts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">Metrics</h1>
        <button
          onClick={loadCounts}
          disabled={loading}
          className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="flex flex-col gap-3 mb-6">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jobs submitted today</h2>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Total</span>
            <span className="text-2xl font-semibold text-zinc-900">{counts?.total ?? "—"}</span>
          </div>
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Quick Apply</span>
            <span className="text-2xl font-semibold text-indigo-600">{counts?.quickApply ?? "—"}</span>
          </div>
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Normal Apply</span>
            <span className="text-2xl font-semibold text-indigo-600">{counts?.normalApply ?? "—"}</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Todos completed</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">This week</span>
            <span className="text-2xl font-semibold text-zinc-900">{todoCounts.week}</span>
          </div>
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">This month</span>
            <span className="text-2xl font-semibold text-zinc-900">{todoCounts.month}</span>
          </div>
          <div className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400">This year</span>
            <span className="text-2xl font-semibold text-zinc-900">{todoCounts.year}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
