"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import { today as todayStr } from "@/app/lib/date";
import { useToast } from "@/app/lib/ToastContext";
import { useOnDateChange } from "@/app/lib/useOnDateChange";

const WARNING_ID = "due-today";
const MAX_TITLES = 3;

// App-wide persistent warning listing incomplete one-off todos due today (Part 98). Repeating
// todos are left out: rollover moves a dated repeating todo's dueDate to each scheduled day, so
// they'd be "due today" nearly every day. Renders nothing itself.
export default function DueTodayWatcher() {
  const router = useRouter();
  const { todos } = useData();
  const { showWarning, dismissWarning } = useToast();
  const [today, setToday] = useState(todayStr());
  useOnDateChange(setToday);

  const dueToday = useMemo(
    () => todos.filter((t) => !t.completed && !t.repeatDays?.length && t.dueDate === today),
    [todos, today]
  );

  // Identifies the current due-today set. Closing the warning (✕ or click) hides it until this
  // changes: a task added or completed, or a new day. A reload also brings it back.
  const signature = `${today}|${dueToday.map((t) => t.id).sort().join(",")}`;
  const [dismissedSignature, setDismissedSignature] = useState<string | null>(null);

  useEffect(() => {
    if (dueToday.length === 0 || dismissedSignature === signature) {
      dismissWarning(WARNING_ID);
      return;
    }
    const titles = dueToday.slice(0, MAX_TITLES).map((t) => t.title).join(", ");
    const more = dueToday.length > MAX_TITLES ? ` +${dueToday.length - MAX_TITLES} more` : "";
    const count = `${dueToday.length} ${dueToday.length === 1 ? "task" : "tasks"}`;
    showWarning(
      WARNING_ID,
      `${count} due today: ${titles}${more}`,
      () => router.push("/"),
      () => setDismissedSignature(signature)
    );
  }, [dueToday, signature, dismissedSignature, showWarning, dismissWarning, router]);

  return null;
}
