"use client";

import { useCallback, useEffect, useRef } from "react";
import { dateLabel } from "./date";
import { firstUnfinishedDay } from "./dayComplete";
import { useToast } from "./ToastContext";
import { useOnDateChange } from "./useOnDateChange";

const WARNING_ID = "unfinished-day";

// Shows the persistent "<day> wasn't marked complete" warning (Part 90) on mount and again
// whenever the calendar date changes, so a tab left open overnight still gets it. Shares
// useOnDateChange with DataContext's rollover. It only warns; it never moves the page's day.
// Returns the check so callers (Day Complete) can re-run it on demand.
export function useUnfinishedDayWarning(goTo: (day: string) => void, enabled = true): () => void {
  const { showWarning, dismissWarning } = useToast();

  // Read through a ref so callers can pass a fresh inline closure without changing `check`.
  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  });

  const check = useCallback(() => {
    const day = firstUnfinishedDay();
    if (day) {
      showWarning(WARNING_ID, `${dateLabel(day)} wasn't marked complete. Click to go to it.`, () =>
        goToRef.current(day)
      );
    } else {
      dismissWarning(WARNING_ID);
    }
  }, [showWarning, dismissWarning]);

  useEffect(() => {
    if (enabled) check();
  }, [enabled, check]);

  useOnDateChange(check, enabled);

  return check;
}
