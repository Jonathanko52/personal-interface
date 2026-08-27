"use client";

import { useMemo, useState } from "react";
import { useData } from "@/app/lib/DataContext";
import {
  completionCounts,
  completedTasks,
  formatCompletedTasksBlock,
  CompletionRange,
} from "@/app/lib/completionStats";

export default function MetricsPage() {
  const { completions, todos } = useData();
  const todoCounts = completionCounts(completions);
  const [range, setRange] = useState<CompletionRange>("day");
  const [copied, setCopied] = useState(false);

  const completedBlock = useMemo(() => {
    const tasks = completedTasks(completions, todos, range);
    return formatCompletedTasksBlock(tasks, range);
  }, [completions, todos, range]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(completedBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the text
      // block is still visible below for the user to select and copy manually.
    }
  }

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

      <section className="flex flex-col gap-3 mt-8">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed tasks</h2>
        <div className="flex gap-1">
          {(["day", "week"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                range === r
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {r === "day" ? "Today" : "This week"}
            </button>
          ))}
        </div>
        <pre className="border border-zinc-200 rounded-md p-3 text-xs text-zinc-700 whitespace-pre-wrap font-mono bg-zinc-50">
          {completedBlock}
        </pre>
        <button
          onClick={handleCopy}
          className="self-start text-xs bg-zinc-800 text-white rounded-md px-3 py-1.5 hover:bg-zinc-900 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </section>
    </div>
  );
}
