import { Completion, Todo } from "./DataContext";
import { toDateString } from "./date";
import { Weight } from "./weight";

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

export interface CompletedTask {
  title: string;
  weight: Weight | null;
}

// A completion whose todoId no longer matches any todo (deleted after being
// completed) still shows up as a placeholder, rather than silently vanishing
// from the list and understating what was actually completed.
export function completedTasks(
  completions: Completion[],
  todos: Todo[],
  range: CompletionRange,
  referenceDate: Date = new Date()
): CompletedTask[] {
  const cutoff = toDateString(range === "day" ? referenceDate : startOfWeek(referenceDate));
  const todoById = new Map(todos.map((t) => [t.id, t]));
  return completions
    .filter((c) => c.date >= cutoff)
    .map((c) => {
      const todo = todoById.get(c.todoId);
      return { title: todo?.title ?? "(deleted task)", weight: todo?.weight ?? null };
    });
}

export function formatCompletedTasksBlock(tasks: CompletedTask[], range: CompletionRange): string {
  const header = range === "day" ? "Completed today:" : "Completed this week:";
  if (tasks.length === 0) return `${header}\n(none)`;
  const lines = tasks.map((t) => (t.weight !== null ? `- ${t.title} (${t.weight})` : `- ${t.title}`));
  return [header, ...lines].join("\n");
}
