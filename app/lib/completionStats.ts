import { Completion, Todo } from "./DataContext";
import { toDateString } from "./date";

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
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

export type CompletionRange = "day" | "week";

// A completion whose todoId no longer matches any todo (deleted after being
// completed) still shows up as a placeholder, rather than silently vanishing
// from the list and understating what was actually completed.
export function completedTaskTitles(
  completions: Completion[],
  todos: Todo[],
  range: CompletionRange,
  referenceDate: Date = new Date()
): string[] {
  const cutoff = toDateString(range === "day" ? referenceDate : startOfWeek(referenceDate));
  const todoById = new Map(todos.map((t) => [t.id, t]));
  return completions
    .filter((c) => c.date >= cutoff)
    .map((c) => todoById.get(c.todoId)?.title ?? "(deleted task)");
}
