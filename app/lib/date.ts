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

// A YYYY-MM-DD string as a local Date at noon (Part 118), so a daylight-saving shift can't
// move it onto the neighboring day.
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

// `dateStr` shifted by `n` days (negative goes back), noon-anchored via parseDate.
export function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

// "Nov 2"
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("default", { month: "short", day: "numeric" });
}

// "Tue, Nov 3", for a YYYY-MM-DD string.
export function formatShortDay(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// "Nov 2 ~ Nov 8"; with `withYear`, "Jan 1 ~ Dec 31, 2026". A single-day range is just "Nov 2".
// Shared by the Metrics page (Part 102) and the Today summary block (Part 105).
export function formatDateRange({ start, end }: { start: Date; end: Date }, withYear = false): string {
  const range =
    start.getTime() === end.getTime() ? formatShortDate(start) : `${formatShortDate(start)} ~ ${formatShortDate(end)}`;
  return withYear ? `${range}, ${end.getFullYear()}` : range;
}

// "Today" / "Tomorrow" / "Yesterday", otherwise e.g. "Monday, Oct 19". Used by the Today page's
// header and the unfinished-day warning.
export function dateLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today()) return "Today";
  if (dateStr === toDateString(tomorrow)) return "Tomorrow";
  if (dateStr === toDateString(yesterday)) return "Yesterday";
  return d.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" });
}
