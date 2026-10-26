"use client";

import { useEffect, useRef } from "react";
import { today as todayStr } from "./date";

// Calls `onChange(today)` when the calendar date has changed since the last check, re-checking
// whenever the tab becomes visible, the window gains focus, the page is restored (pageshow),
// and once a minute. A single interval isn't reliable on its own for a long-lived tab, since
// browsers throttle timers in background tabs (Part 5). Doesn't fire on mount; callers do their
// own initial work. Shared by DataContext's rollover and the unfinished-day warning, so both
// notice a new day at the same moments.
export function useOnDateChange(onChange: (today: string) => void, enabled = true) {
  // Read through a ref so callers can pass a fresh inline closure without restarting the
  // listeners below.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!enabled) return;
    let lastChecked = todayStr();

    function checkIfNewDay() {
      const current = todayStr();
      if (current === lastChecked) return;
      lastChecked = current;
      onChangeRef.current(current);
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
  }, [enabled]);
}
