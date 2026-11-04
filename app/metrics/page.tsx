"use client";

import { useEffect, useState } from "react";
import { useData } from "@/app/lib/DataContext";
import { countCompletionsBetween, periodRanges, PeriodRange, PeriodRanges } from "@/app/lib/completionStats";
import { countJobsByPeriod } from "@/app/lib/jobMetrics";
import { formatDateRange, formatShortDate, formatShortDay, toDateString } from "@/app/lib/date";

// Labels for the steppable periods (Parts 104, 107): the current one, the one before, then by date.
function dayLabel(offset: number, range: PeriodRange): string {
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  return formatShortDay(toDateString(range.start));
}

function weekLabel(offset: number, range: PeriodRange): string {
  if (offset === 0) return "This week";
  if (offset === -1) return "Last week";
  return `Week of ${formatShortDate(range.start)}`;
}

function monthLabel(offset: number, range: PeriodRange): string {
  if (offset === 0) return "This month";
  if (offset === -1) return "Last month";
  return range.start.toLocaleDateString("default", { month: "long", year: "numeric" });
}

// ‹ › next to a period's date range. › stops at the current period, since later ones are always 0.
function Stepper({ offset, onChange }: { offset: number; onChange: (offset: number) => void }) {
  const button =
    "text-base leading-none px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent";
  return (
    <span className="inline-flex items-center align-middle">
      <button onClick={() => onChange(offset - 1)} aria-label="Previous" className={button}>
        ‹
      </button>
      <button onClick={() => onChange(offset + 1)} disabled={offset >= 0} aria-label="Next" className={button}>
        ›
      </button>
    </span>
  );
}

type ListedJob = { dateApplied: string; categories: string[] };

export default function MetricsPage() {
  const { completions } = useData();
  // One offset per steppable period, shared by its todo card and its jobs-table row so both
  // always show the same range. Plain state: back to the current period on leaving the page.
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const periods = periodRanges(new Date(), { day: dayOffset, week: weekOffset, month: monthOffset });

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

  const weekStepper = <Stepper offset={weekOffset} onChange={setWeekOffset} />;
  const monthStepper = <Stepper offset={monthOffset} onChange={setMonthOffset} />;

  const cards = [
    { label: weekLabel(weekOffset, periods.week), range: formatDateRange(periods.week), period: periods.week, stepper: weekStepper },
    { label: monthLabel(monthOffset, periods.month), range: formatDateRange(periods.month), period: periods.month, stepper: monthStepper },
    { label: "This year", range: formatDateRange(periods.year, true), period: periods.year, stepper: null },
  ];

  const jobRows: { key: keyof PeriodRanges; label: string; range: string; stepper: React.ReactNode }[] = [
    {
      key: "day",
      label: dayLabel(dayOffset, periods.day),
      range: formatDateRange(periods.day),
      stepper: <Stepper offset={dayOffset} onChange={setDayOffset} />,
    },
    { key: "week", label: weekLabel(weekOffset, periods.week), range: formatDateRange(periods.week), stepper: weekStepper },
    { key: "month", label: monthLabel(monthOffset, periods.month), range: formatDateRange(periods.month), stepper: monthStepper },
    { key: "year", label: "This year", range: formatDateRange(periods.year, true), stepper: null },
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
              <span className="text-[11px] text-zinc-400/80">
                {card.range} {card.stepper}
              </span>
              <span className="text-2xl font-semibold text-zinc-700">
                {countCompletionsBetween(completions, card.period)}
              </span>
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
                {jobRows.map((row) => {
                  const counts = jobCounts[row.key];
                  return (
                    <tr key={row.key} className="border-b border-zinc-200 last:border-b-0">
                      <td className="px-4 py-2">
                        <span className="text-zinc-700">{row.label}</span>
                        <span className="block text-[11px] text-zinc-400/80">
                          {row.range} {row.stepper}
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
