import { today as todayStr, toDateString } from "./date";

// The latest day marked complete via "Day Complete" (Part 90; Part 60 stored the click date).
const LAST_ACKNOWLEDGED_DATE_KEY = "lastAcknowledgedDate";

// No default fallback here on purpose — a brand-new load with nothing stored yet means
// "nothing to warn about," not "today is already acknowledged."
export function getLastAcknowledgedDate(): string | null {
  try {
    return localStorage.getItem(LAST_ACKNOWLEDGED_DATE_KEY);
  } catch {
    return null;
  }
}

// Marks `date` (the day on screen, not necessarily the real date) complete. The marker only
// moves forward, so completing an older day never un-completes a later one.
export function markDayComplete(date: string): string {
  const existing = getLastAcknowledgedDate();
  const next = existing && existing > date ? existing : date;
  try {
    localStorage.setItem(LAST_ACKNOWLEDGED_DATE_KEY, next);
  } catch {}
  return next;
}

// The earliest day not yet marked complete — the day after the marker — if it's before
// `today`. Null when caught up, or when nothing has ever been marked.
export function firstUnfinishedDay(today: string = todayStr()): string | null {
  const last = getLastAcknowledgedDate();
  if (!last) return null;
  const d = new Date(last + "T12:00:00");
  d.setDate(d.getDate() + 1);
  const next = toDateString(d);
  return next < today ? next : null;
}
