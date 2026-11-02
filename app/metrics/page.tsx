"use client";

import { useData } from "@/app/lib/DataContext";
import { completionCounts, periodRanges, PeriodRange } from "@/app/lib/completionStats";

// "Nov 2 ~ Nov 8"; with `withYear`, "Jan 1 ~ Dec 31, 2026". A single-day range is just "Nov 2".
function formatRange({ start, end }: PeriodRange, withYear = false): string {
  const short = (d: Date) => d.toLocaleDateString("default", { month: "short", day: "numeric" });
  const range = start.getTime() === end.getTime() ? short(start) : `${short(start)} ~ ${short(end)}`;
  return withYear ? `${range}, ${end.getFullYear()}` : range;
}

export default function MetricsPage() {
  const { completions } = useData();
  const todoCounts = completionCounts(completions);
  const periods = periodRanges();

  const cards = [
    { label: "This week", range: formatRange(periods.week), count: todoCounts.week },
    { label: "This month", range: formatRange(periods.month), count: todoCounts.month },
    { label: "This year", range: formatRange(periods.year, true), count: todoCounts.year },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-700 mb-6">Metrics</h1>

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
    </div>
  );
}
