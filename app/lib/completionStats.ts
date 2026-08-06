import { Completion } from "./DataContext";
import { toDateString } from "./date";

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  return date;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function countSince(completions: Completion[], cutoff: string): number {
  return completions.filter((c) => c.date >= cutoff).length;
}

export interface CompletionCounts {
  week: number;
  month: number;
  year: number;
}

export function completionCounts(completions: Completion[], referenceDate: Date = new Date()): CompletionCounts {
  return {
    week: countSince(completions, toDateString(startOfWeek(referenceDate))),
    month: countSince(completions, toDateString(startOfMonth(referenceDate))),
    year: countSince(completions, toDateString(startOfYear(referenceDate))),
  };
}
