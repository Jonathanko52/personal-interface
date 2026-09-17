"use client";

import { useEffect, useState } from "react";
import {
  JobCounts,
  getJobCounts,
  resetJobCounts,
  incrementJobCount,
  JOB_COUNTS_CHANGED_EVENT,
} from "./jobCounts";
import { ApplyTypeCode } from "./jobFields";

export function useJobCounts() {
  const [counts, setCounts] = useState<JobCounts | null>(null);

  useEffect(() => {
    // Read on mount, in a client-only effect — localStorage isn't available during SSR.
    setCounts(getJobCounts());

    function handleChange() {
      setCounts(getJobCounts());
    }
    window.addEventListener(JOB_COUNTS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(JOB_COUNTS_CHANGED_EVENT, handleChange);
  }, []);

  function increment(applyType: ApplyTypeCode) {
    // Don't set state directly from the return value here — let the event listener above
    // do it, so every consumer (including this one) updates through the same single path.
    incrementJobCount(applyType);
  }

  function reset() {
    resetJobCounts();
  }

  return { counts, increment, reset };
}
