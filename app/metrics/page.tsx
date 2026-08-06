"use client";

import { useData } from "@/app/lib/DataContext";
import { completionCounts } from "@/app/lib/completionStats";

export default function MetricsPage() {
  const { completions } = useData();
  const todoCounts = completionCounts(completions);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Metrics</h1>

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
