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

export interface WeightedTask {
  title: string;
  weight: Weight | null;
  isDaily: boolean;
}

// A completion whose todoId no longer matches any todo (deleted after being
// completed) still shows up as a placeholder, rather than silently vanishing
// from the list and understating what was actually completed.
export function completedTasks(
  completions: Completion[],
  todos: Todo[],
  range: CompletionRange,
  referenceDate: Date = new Date()
): WeightedTask[] {
  const today = toDateString(referenceDate);
  const cutoff = range === "day" ? today : toDateString(startOfWeek(referenceDate));
  const todoById = new Map(todos.map((t) => [t.id, t]));
  return completions
    .filter((c) => c.date >= cutoff)
    .filter((c) => {
      // A completion logged today is only still valid if the todo is still
      // currently completed — if it's been unchecked since, this is a stale
      // log entry from a same-day check-then-uncheck, not a real completion.
      // Entries from earlier days are left alone: a repeating todo may have
      // legitimately been reset to incomplete by rollover's normal daily
      // cycle since then, which isn't the same thing as the user undoing it.
      if (c.date !== today) return true;
      const todo = todoById.get(c.todoId);
      return !todo || todo.completed;
    })
    .map((c) => {
      const todo = todoById.get(c.todoId);
      return {
        title: todo?.title ?? "(deleted task)",
        weight: todo?.weight ?? null,
        isDaily: todo ? todo.repeatDays.length > 0 : false,
      };
    });
}

// Scoped to the current day regardless of the completed-tasks day/week toggle:
// no due date (indefinite, always "on your plate"), due today, or overdue —
// excludes todos due in the future, since those aren't relevant yet.
export function uncompletedTasksToday(todos: Todo[], referenceDate: Date = new Date()): WeightedTask[] {
  const today = toDateString(referenceDate);
  return todos
    .filter((t) => !t.completed && (t.dueDate === null || t.dueDate <= today))
    .map((t) => ({ title: t.title, weight: t.weight, isDaily: t.repeatDays.length > 0 }));
}

function sumWeightsSplit(tasks: WeightedTask[]): { daily: number; oneOff: number } {
  return tasks.reduce(
    (acc, t) => {
      if (t.isDaily) acc.daily += t.weight ?? 0;
      else acc.oneOff += t.weight ?? 0;
      return acc;
    },
    { daily: 0, oneOff: 0 }
  );
}

function formatTaskLines(tasks: WeightedTask[]): string[] {
  if (tasks.length === 0) return ["(none)"];
  return tasks.map((t) => (t.weight !== null ? `- ${t.title} (${t.weight})` : `- ${t.title}`));
}

export function formatTasksSummaryBlock(
  completed: WeightedTask[],
  uncompleted: WeightedTask[],
  range: CompletionRange
): string {
  const completedHeader = range === "day" ? "Completed today:" : "Completed this week:";
  const completedSplit = sumWeightsSplit(completed);
  const uncompletedSplit = sumWeightsSplit(uncompleted);
  const totalCount = completed.length + uncompleted.length;

  return [
    completedHeader,
    ...formatTaskLines(completed),
    `Completed points — Daily: ${completedSplit.daily}, One-off: ${completedSplit.oneOff}`,
    "",
    "Uncompleted:",
    ...formatTaskLines(uncompleted),
    `Uncompleted points — Daily: ${uncompletedSplit.daily}, One-off: ${uncompletedSplit.oneOff}`,
    "",
    `${completed.length} completed / ${totalCount} completed+uncompleted`,
  ].join("\n");
}
