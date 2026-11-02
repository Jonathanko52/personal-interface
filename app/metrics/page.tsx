"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/lib/DataContext";
import { completionCounts, periodRanges, PeriodRange, PeriodRanges } from "@/app/lib/completionStats";
import { countJobsByPeriod } from "@/app/lib/jobMetrics";

// "Nov 2 ~ Nov 8"; with `withYear`, "Jan 1 ~ Dec 31, 2026". A single-day range is just "Nov 2".
function formatRange({ start, end }: PeriodRange, withYear = false): string {
  const short = (d: Date) => d.toLocaleDateString("default", { month: "short", day: "numeric" });
  const range = start.getTime() === end.getTime() ? short(start) : `${short(start)} ~ ${short(end)}`;
  return withYear ? `${range}, ${end.getFullYear()}` : range;
}

const JOB_ROWS: { key: keyof PeriodRanges; label: string; withYear?: boolean }[] = [
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year", withYear: true },
];

type ListedJob = { dateApplied: string; categories: string[] };

export default function MetricsPage() {
  const { completions } = useData();
  const todoCounts = completionCounts(completions);
  const periods = periodRanges();

  // Job counts come from the Sheet (via the same route as the Applications page), separate from
  // the Jobs panel's manual counter. Only this section waits on the fetch.
  const [jobs, setJobs] = useState<ListedJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data) => setJobs(data.jobs))
      .catch((err) => setJobsError(err instanceof Error ? err.message : "Something went wrong."));
  }, []);

  const jobCounts = jobs ? countJobsByPeriod(jobs, periods) : null;

  const cards = [
    { label: "This week", range: formatRange(periods.week), count: todoCounts.week },
    { label: "This month", range: formatRange(periods.month), count: todoCounts.month },
    { label: "This year", range: formatRange(periods.year, true), count: todoCounts.year },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-zinc-700">Metrics</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Todos completed</h2>
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <div key={card.label} className="border border-zinc-200 rounded-md p-4 flex flex-col gap-1">
              <span className="text-xs text-zinc-400">{card.label}</span>
              <span className="text-[11px] text-zinc-400/80">{card.range}</span>
              <span className="text-2xl font-semibold text-zinc-700">{card.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jobs applied</h2>
        {jobsError ? (
          <p className="text-sm text-red-500">{jobsError}</p>
        ) : !jobCounts ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : (
          <div className="border border-zinc-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                  <th className="text-left font-medium px-4 py-2">Period</th>
                  <th className="text-right font-medium px-4 py-2">Programming</th>
                  <th className="text-right font-medium px-4 py-2">Non-programming</th>
                  <th className="text-right font-medium px-4 py-2">Both</th>
                </tr>
              </thead>
              <tbody>
                {JOB_ROWS.map((row) => {
                  const counts = jobCounts[row.key];
                  return (
                    <tr key={row.key} className="border-b border-zinc-200 last:border-b-0">
                      <td className="px-4 py-2">
                        <span className="text-zinc-700">{row.label}</span>
                        <span className="block text-[11px] text-zinc-400/80">
                          {formatRange(periods[row.key], row.withYear)}
                        </span>
                      </td>
                      <td className="text-right px-4 py-2 text-zinc-700 tabular-nums">{counts.programming}</td>
                      <td className="text-right px-4 py-2 text-zinc-700 tabular-nums">{counts.nonProgramming}</td>
                      <td className="text-right px-4 py-2 font-semibold text-zinc-700 tabular-nums">{counts.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
