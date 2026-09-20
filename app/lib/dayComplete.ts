import { today as todayStr } from "./date";

const LAST_ACKNOWLEDGED_DATE_KEY = "lastAcknowledgedDate";

// No default fallback here on purpose — a brand-new load with nothing stored yet means
// "needs acknowledgment," not "today is already acknowledged."
export function getLastAcknowledgedDate(): string | null {
  try {
    return localStorage.getItem(LAST_ACKNOWLEDGED_DATE_KEY);
  } catch {
    return null;
  }
}

export function markDayComplete(): string {
  const date = todayStr();
  try {
    localStorage.setItem(LAST_ACKNOWLEDGED_DATE_KEY, date);
  } catch {}
  return date;
}
