// Shared localStorage read/write, extracted from DataContext.tsx's own former private
// load/save so other modules (jobCounts.ts, useJobStack.ts) don't each reimplement the same
// try/catch JSON get/set shape.

export function readJSON<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
