import type { PeriodRanges } from "./completionStats";
import { isProgrammingJob } from "./jobFields";
import { parseSheetDate } from "./sheetDate";

export interface JobCounts {
  programming: number;
  nonProgramming: number;
  total: number;
}

export type JobCountsByPeriod = Record<keyof PeriodRanges, JobCounts>;

// Job applications per period for the Metrics page (Part 103), split by isProgrammingJob. A job
// counts in a period when its applied date (MM/DD/YY, parsed to local midnight) falls between
// the period's start and end inclusive; rows with an unparseable date are left out.
export function countJobsByPeriod(
  jobs: { dateApplied: string; categories: string[] }[],
  periods: PeriodRanges
): JobCountsByPeriod {
  const keys = Object.keys(periods) as (keyof PeriodRanges)[];
  const result = Object.fromEntries(
    keys.map((k) => [k, { programming: 0, nonProgramming: 0, total: 0 }])
  ) as JobCountsByPeriod;

  for (const job of jobs) {
    const applied = parseSheetDate(job.dateApplied);
    if (!applied) continue;
    const programming = isProgrammingJob(job.categories);
    for (const k of keys) {
      const { start, end } = periods[k];
      if (applied < start || applied > end) continue;
      result[k].total += 1;
      if (programming) result[k].programming += 1;
      else result[k].nonProgramming += 1;
    }
  }
  return result;
}
