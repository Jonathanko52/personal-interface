import { useRef, useState } from "react";

interface UseJobSaveFlowOptions {
  isValid: boolean;
  getCompanyName: () => string;
  buildPayload: () => Record<string, unknown>;
  onSaved: () => void;
}

export function useJobSaveFlow({ isValid, getCompanyName, buildPayload, onSaved }: UseJobSaveFlowOptions) {
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);

  function resetSaveState() {
    setSaved(false);
    setConfirmDuplicate(false);
    setCheckFailed(false);
    setError(null);
  }

  async function doSave() {
    if (!isValid || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setConfirmDuplicate(false);
    setError(null);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataOne: buildPayload() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Something went wrong.") + " You can try saving again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function handleSaveClick() {
    if (!isValid || savingRef.current) return;
    setError(null);
    setCheckFailed(false);
    setChecking(true);
    let checkOk = true;
    try {
      const res = await fetch(`/api/jobs/check?company=${encodeURIComponent(getCompanyName())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        checkOk = false;
      } else if (data.duplicate) {
        setChecking(false);
        setConfirmDuplicate(true);
        return;
      }
    } catch {
      checkOk = false;
    } finally {
      setChecking(false);
    }
    // If the duplicate check itself fails, don't block saving on it — just surface that it didn't run.
    if (!checkOk) setCheckFailed(true);
    await doSave();
  }

  return {
    checking,
    saving,
    saved,
    setSaved,
    confirmDuplicate,
    setConfirmDuplicate,
    checkFailed,
    error,
    setError,
    handleSaveClick,
    doSave,
    resetSaveState,
  };
}
