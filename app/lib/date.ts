export function dateParts(date: Date): { year: string; month: string; day: string } {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
}

export function toDateString(date: Date): string {
  const { year, month, day } = dateParts(date);
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return toDateString(new Date());
}

// `dateStr` shifted by `n` days (negative goes back). Anchored at noon, like the rest of the
// app, so a daylight-saving shift can't land it on the wrong day.
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

// "Today" / "Tomorrow" / "Yesterday", otherwise e.g. "Monday, Oct 19". Used by the Today page's
// header and the unfinished-day warning.
export function dateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today()) return "Today";
  if (dateStr === toDateString(tomorrow)) return "Tomorrow";
  if (dateStr === toDateString(yesterday)) return "Yesterday";
  return d.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" });
}
