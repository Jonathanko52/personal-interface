"use client";

import { useCallback, useEffect, useRef } from "react";
import { today as todayStr, dateLabel } from "./date";
import { firstUnfinishedDay } from "./dayComplete";
import { useToast } from "./ToastContext";

// Shows the persistent "<day> wasn't marked complete" warning (Part 90) on mount and again
// whenever the calendar date changes, so a tab left open overnight still gets it. Uses the same
// triggers as DataContext's rollover re-check. It only warns; it never moves the page's day.
// Returns the check so callers (Day Complete) can re-run it on demand.
export function useUnfinishedDayWarning(goTo: (day: string) => void, enabled = true): () => void {
  const { showWarning, dismissWarning } = useToast();

  // Read through a ref so callers can pass a fresh inline closure without restarting the
  // listeners below.
  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  });

  const check = useCallback(() => {
    const day = firstUnfinishedDay();
    if (day) {
      showWarning(`${dateLabel(day)} wasn't marked complete. Click to go to it.`, () => goToRef.current(day));
    } else {
      dismissWarning();
    }
  }, [showWarning, dismissWarning]);

  useEffect(() => {
    if (!enabled) return;
    let lastChecked = todayStr();
    check();

    function checkIfNewDay() {
      const current = todayStr();
      if (current === lastChecked) return;
      lastChecked = current;
      check();
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") checkIfNewDay();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkIfNewDay);
    window.addEventListener("pageshow", checkIfNewDay);
    const intervalId = setInterval(checkIfNewDay, 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkIfNewDay);
      window.removeEventListener("pageshow", checkIfNewDay);
      clearInterval(intervalId);
    };
  }, [enabled, check]);

  return check;
}
