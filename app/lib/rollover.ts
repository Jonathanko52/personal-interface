import { toDateString } from "./date";
import type { Todo } from "./DataContext";

export function nextOccurrenceOnOrAfter(fromDate: string, repeatDays: number[]): string {
  const date = new Date(fromDate + "T12:00:00");
  for (let i = 0; i < 7; i++) {
    if (repeatDays.includes(date.getDay())) return toDateString(date);
    date.setDate(date.getDate() + 1);
  }
  return fromDate;
}

export function rolloverTodos(todos: Todo[], today: string): Todo[] {
  return todos
    .map((t) => {
      if (!t.completed) return t;
      if (t.repeatDays?.length) {
        const anchor = t.dueDate ?? t.lastCompletedDate ?? null;
        if (anchor && anchor >= today) return t;
        const nextDue = nextOccurrenceOnOrAfter(today, t.repeatDays);
        if (nextDue !== today) return t;
        return { ...t, completed: false, dueDate: t.dueDate ? nextDue : null, lastCompletedDate: null };
      }
      if (!t.dueDate || t.dueDate >= today) return t;
      return null;
    })
    .filter((t): t is Todo => t !== null);
}
