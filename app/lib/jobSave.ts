// Plain, hook-free network calls shared between useJobSaveFlow.ts (React-state-driven,
// one item at a time) and app/jobs/new/page.tsx's handleSaveAll (a headless batch loop) —
// extracted so both share one implementation instead of duplicating the fetch logic.

export interface DuplicateCheckResult {
  duplicate: boolean;
  checkFailed: boolean;
}

export async function checkDuplicate(companyName: string): Promise<DuplicateCheckResult> {
  try {
    const res = await fetch(`/api/jobs/check?company=${encodeURIComponent(companyName)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { duplicate: false, checkFailed: true };
    return { duplicate: Boolean(data.duplicate), checkFailed: false };
  } catch {
    return { duplicate: false, checkFailed: true };
  }
}

export type SaveJobResult = { ok: true } | { ok: false; error: string };

export async function saveJob(payload: Record<string, unknown>): Promise<SaveJobResult> {
  try {
    const res = await fetch("/api/jobs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataOne: payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `Save failed (${res.status})` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
