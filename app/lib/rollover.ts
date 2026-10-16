import { toDateString } from "./date";
import type { Todo } from "./DataContext";

// The one place that decides whether a repeat schedule lands on a given day. Currently
// weekday-based; a future schedule type ("every N days", monthly) only needs to change this.
export function occursOn(repeatDays: number[], dateStr: string): boolean {
  return repeatDays.includes(new Date(dateStr + "T12:00:00").getDay());
}

export function nextOccurrenceOnOrAfter(fromDate: string, repeatDays: number[]): string {
  const date = new Date(fromDate + "T12:00:00");
  for (let i = 0; i < 7; i++) {
    const dateStr = toDateString(date);
    if (occursOn(repeatDays, dateStr)) return dateStr;
    date.setDate(date.getDate() + 1);
  }
  return fromDate;
}

export function rolloverTodos(todos: Todo[], today: string): Todo[] {
  return todos.map((t) => {
    if (!t.completed || !t.repeatDays?.length) return t;
    const anchor = t.dueDate ?? t.lastCompletedDate ?? null;
    if (anchor && anchor >= today) return t;
    const nextDue = nextOccurrenceOnOrAfter(today, t.repeatDays);
    if (nextDue !== today) return t;
    return { ...t, completed: false, dueDate: t.dueDate ? nextDue : null, lastCompletedDate: null };
  });
}
