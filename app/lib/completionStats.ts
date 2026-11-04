import { Completion, Todo } from "./DataContext";
import { toDateString, formatShortDay, formatDateRange } from "./date";
import { Weight } from "./weight";
import { isDailyTodo } from "./groupTodos";
import { occursOn } from "./rollover";

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  return date;
}

// A repeating todo shares one live `completed` field with no per-day history — rollover
// already resets it for the current day, so a past day needs to derive its actual state
// from the completions log instead. One-off todos are left untouched, since their
// `completed` field is never reset and is already historically accurate as-is.
export function overrideCompletedFromLog(
  todos: Todo[],
  dateStr: string,
  completions: Completion[],
  isPastDay: boolean
): Todo[] {
  if (!isPastDay) return todos;
  return todos.map((t) =>
    isDailyTodo(t)
      ? { ...t, completed: completions.some((c) => c.todoId === t.id && c.date === dateStr) }
      : t
  );
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

export interface PeriodRange {
  start: Date;
  end: Date;
}

export interface PeriodRanges {
  day: PeriodRange;
  week: PeriodRange;
  month: PeriodRange;
  year: PeriodRange;
}

// Full calendar periods containing `referenceDate`, each start/end at local midnight and
// inclusive: the day itself, Monday–Sunday, the 1st to the last day of the month, Jan 1–Dec 31.
// Shown as date ranges on the Metrics page (Part 102) and used to bucket job counts (Part 103).
// `offsets` steps the week (by 7 days) or month (by calendar months) away from the current one,
// for the Metrics page's ‹ › navigation (Part 104); negative goes back. `day` steps by single
// days (Part 107). Each offset moves only its own period.
export function periodRanges(
  referenceDate: Date = new Date(),
  offsets: { day?: number; week?: number; month?: number } = {}
): PeriodRanges {
  const day = new Date(referenceDate);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() + (offsets.day ?? 0));
  const weekStart = startOfWeek(referenceDate);
  weekStart.setDate(weekStart.getDate() + 7 * (offsets.week ?? 0));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const currentMonth = startOfMonth(referenceDate);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (offsets.month ?? 0), 1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const yearStart = startOfYear(referenceDate);
  const yearEnd = new Date(yearStart.getFullYear(), 11, 31);
  return {
    day: { start: day, end: day },
    week: { start: weekStart, end: weekEnd },
    month: { start: monthStart, end: monthEnd },
    year: { start: yearStart, end: yearEnd },
  };
}

// Completions logged within `range`, start and end inclusive. Unlike countSince, this has an
// upper bound, so a past week or month counts only its own days (Part 104).
export function countCompletionsBetween(completions: Completion[], { start, end }: PeriodRange): number {
  const from = toDateString(start);
  const to = toDateString(end);
  return completions.filter((c) => c.date >= from && c.date <= to).length;
}

// Every day in `range` (start to end inclusive), as YYYY-MM-DD. Steps with setDate, so a
// daylight-saving shift can't skip or repeat a day.
export function daysIn({ start, end }: PeriodRange): string[] {
  const days: string[] = [];
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) days.push(toDateString(d));
  return days;
}

// Completions logged on each day of `range`, zeros included, for the Metrics chart (Part 108).
export function completionsPerDay(completions: Completion[], range: PeriodRange): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const c of completions) counts.set(c.date, (counts.get(c.date) ?? 0) + 1);
  return daysIn(range).map((date) => ({ date, count: counts.get(date) ?? 0 }));
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
    // Upper bound too: a referenceDate in the past (an earlier day still being viewed) must
    // not pull in completions logged after it.
    .filter((c) => c.date >= cutoff && c.date <= today)
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
      if (todo) return { title: todo.title, weight: todo.weight, isDaily: isDailyTodo(todo) };
      // Deleted (e.g. by Day Complete, Part 100): fall back to the snapshot taken when it was
      // checked off. Entries logged before Part 100 have none.
      return {
        title: c.title ?? "(deleted task)",
        weight: c.weight ?? null,
        isDaily: c.isDaily ?? false,
      };
    });
}

// Scoped to the current day regardless of the completed-tasks day/week toggle:
// no due date (indefinite, always "on your plate"), due today, or overdue —
// excludes todos due in the future, since those aren't relevant yet.
// A no-due-date repeating todo only counts on its scheduled days (matching Daily Tasks, Part 88);
// everything else counts when it has no due date or is due on or before the day.
export function uncompletedTasksOn(todos: Todo[], referenceDate: Date = new Date()): WeightedTask[] {
  const day = toDateString(referenceDate);
  return todos
    .filter((t) => {
      if (t.completed) return false;
      if (t.dueDate === null && t.repeatDays?.length) return occursOn(t.repeatDays, day);
      return t.dueDate === null || t.dueDate <= day;
    })
    .map((t) => ({ title: t.title, weight: t.weight, isDaily: isDailyTodo(t) }));
}

function splitBy(tasks: WeightedTask[], valueOf: (t: WeightedTask) => number): { daily: number; oneOff: number } {
  return tasks.reduce(
    (acc, t) => {
      if (t.isDaily) acc.daily += valueOf(t);
      else acc.oneOff += valueOf(t);
      return acc;
    },
    { daily: 0, oneOff: 0 }
  );
}

function formatTaskLine(t: WeightedTask): string {
  return t.weight !== null ? `- ${t.title} (${t.weight})` : `- ${t.title}`;
}

function formatTaskGroup(tasks: WeightedTask[]): string[] {
  return tasks.length === 0 ? ["(none)"] : tasks.map(formatTaskLine);
}

function formatTaskLines(tasks: WeightedTask[]): string[] {
  const daily = tasks.filter((t) => t.isDaily);
  const oneOff = tasks.filter((t) => !t.isDaily);
  return ["Daily:", ...formatTaskGroup(daily), "One-off:", ...formatTaskGroup(oneOff)];
}

// `referenceDate` is the day on screen (Part 89), so headers name its date rather than "today"
// (Part 105). "Uncompleted" is always that single day (Part 28 item 7), even in week mode.
export function formatTasksSummaryBlock(
  completed: WeightedTask[],
  uncompleted: WeightedTask[],
  range: CompletionRange,
  referenceDate: Date
): string {
  const day = formatShortDay(toDateString(referenceDate));
  const completedHeader =
    range === "day"
      ? `Completed (${day}):`
      : `Completed this week (${formatDateRange(periodRanges(referenceDate).week)}):`;
  const completedSplit = splitBy(completed, (t) => t.weight ?? 0);
  const uncompletedSplit = splitBy(uncompleted, (t) => t.weight ?? 0);
  const completedCountSplit = splitBy(completed, () => 1);
  const uncompletedCountSplit = splitBy(uncompleted, () => 1);

  return [
    completedHeader,
    ...formatTaskLines(completed),
    `Completed points — Daily: ${completedSplit.daily}, One-off: ${completedSplit.oneOff}`,
    "",
    `Uncompleted (${day}):`,
    ...formatTaskLines(uncompleted),
    `Uncompleted points — Daily: ${uncompletedSplit.daily}, One-off: ${uncompletedSplit.oneOff}`,
    "",
    `One-off: ${completedCountSplit.oneOff} completed / ${completedCountSplit.oneOff + uncompletedCountSplit.oneOff} completed+uncompleted`,
    `Daily: ${completedCountSplit.daily} completed / ${completedCountSplit.daily + uncompletedCountSplit.daily} completed+uncompleted`,
  ].join("\n");
}
