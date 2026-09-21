import { useRef, useState } from "react";
import { checkDuplicate, saveJob } from "./jobSave";

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
    const result = await saveJob(buildPayload());
    if (result.ok) {
      setSaved(true);
      onSaved();
    } else {
      setError(result.error + " You can try saving again.");
    }
    savingRef.current = false;
    setSaving(false);
  }

  async function handleSaveClick() {
    if (!isValid || savingRef.current) return;
    setError(null);
    setCheckFailed(false);
    setChecking(true);
    const { duplicate, checkFailed: failed } = await checkDuplicate(getCompanyName());
    setChecking(false);
    if (duplicate) {
      setConfirmDuplicate(true);
      return;
    }
    // If the duplicate check itself fails, don't block saving on it — just surface that it didn't run.
    if (failed) setCheckFailed(true);
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
