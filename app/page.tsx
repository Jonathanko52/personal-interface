"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import TodoDetail from "./components/TodoDetail";
import TodoListPage from "./components/TodoListPage";
import { useData } from "./lib/DataContext";
import { useSortFilter } from "./lib/useSortFilter";
import { useSelectedTodo } from "./lib/useSelectedTodo";
import { today as todayStr, toDateString, dateLabel, addDays } from "./lib/date";
import { completedTasks, uncompletedTasksOn, formatTasksSummaryBlock, overrideCompletedFromLog, CompletionRange } from "./lib/completionStats";
import { markDayComplete } from "./lib/dayComplete";
import { useUnfinishedDayWarning } from "./lib/useUnfinishedDayWarning";
import { resetJobCounts } from "./lib/jobCounts";
import { occursOn } from "./lib/rollover";

// A boolean that flips true then auto-resets after `duration` — the "Copied!"/"Refreshed!"/
// "Day marked ✓" feedback pattern, previously hand-rolled three times in this same file.
function useBriefFlag(duration = 1500): [boolean, () => void] {
  const [active, setActive] = useState(false);
  function trigger() {
    setActive(true);
    setTimeout(() => setActive(false), duration);
  }
  return [active, trigger];
}

export default function Home() {
  const router = useRouter();
  const { todos, completions, clearTodos, resetTodos } = useData();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [completedRange, setCompletedRange] = useState<CompletionRange>("day");
  const [copied, triggerCopied] = useBriefFlag();
  const [refreshed, triggerRefreshed] = useBriefFlag();
  const [dayMarked, triggerDayMarked] = useBriefFlag();

  const todayValue = todayStr();
  const isViewingToday = selectedDate === todayValue;

  // Built for the day on screen, not the real date: after midnight an open page stays on the
  // previous day (it never advances on its own) while rollover has already reset the live `completed` fields,
  // so a past day's repeating todos read their state from the completions log instead.
  const completedBlock = useMemo(() => {
    const dayTodos = overrideCompletedFromLog(todos, selectedDate, completions, !isViewingToday);
    const referenceDate = new Date(selectedDate + "T12:00:00");
    const completed = completedTasks(completions, dayTodos, completedRange, referenceDate);
    const uncompleted = uncompletedTasksOn(dayTodos, referenceDate);
    return formatTasksSummaryBlock(completed, uncompleted, completedRange);
  }, [completions, todos, completedRange, selectedDate, isViewingToday]);

  function handleRefresh() {
    // The block is already a useMemo keyed on [completions, todos, completedRange, selectedDate], so it
    // recomputes automatically whenever a todo is checked/unchecked — this button doesn't
    // change that. It's a visible confirmation that what's shown is current, not a fix for
    // staleness (none is known); same brief-label-flip feedback pattern as Copy below.
    triggerRefreshed();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(completedBlock);
      triggerCopied();
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the text
      // block is still visible below for the user to select and copy manually.
    }
  }

  function goToDay(day: string) {
    setSelectedDate(day);
    router.replace(`/?date=${day}`);
  }

  // Rather than opening on an unfinished day, point to it with a persistent warning (Part 90),
  // re-checked whenever the date changes while this page is open (Part 91). This page's own
  // instance, so clicking it can switch the already-mounted day in place.
  const recheckUnfinishedDay = useUnfinishedDayWarning(goToDay);

  // Opens on today (the initial state) unless a ?date= link says otherwise. The page never
  // changes day on its own at midnight; only navigation moves selectedDate.
  useEffect(() => {
    const date = new URLSearchParams(window.location.search).get("date");
    if (date) setSelectedDate(date);
  }, []);

  function prevDay() {
    goToDay(addDays(selectedDate, -1));
  }

  function nextDay() {
    goToDay(addDays(selectedDate, 1));
  }

  function goToday() {
    setSelectedDate(todayStr());
    router.replace("/");
  }

  // Marks the day on screen (which, after midnight, may still be yesterday), then returns to today.
  function handleDayComplete() {
    markDayComplete(selectedDate);
    resetJobCounts();
    goToday();
    triggerDayMarked();
    recheckUnfinishedDay();
  }

  // Daily Tasks: repeating todos, day-scoped, with the past-day history override (Part 40)
  // when not viewing today.
  const dailyTodosForDate = useMemo(
    () =>
      overrideCompletedFromLog(
        todos.filter((t) => {
          if (!t.repeatDays?.length) return false;
          // Any other day: everything scheduled (or due) that day, independent of the live
          // fields, which rollover may already have moved on (e.g. a dueDate advanced at midnight).
          if (!isViewingToday) return occursOn(t.repeatDays, selectedDate) || t.dueDate === selectedDate;
          // No due date: shown only on its scheduled days, never carried over to an unscheduled one.
          if (t.dueDate === null) return occursOn(t.repeatDays, selectedDate);
          return (
            t.dueDate === selectedDate ||
            (isViewingToday && !t.completed) ||
            (isViewingToday && t.lastCompletedDate === todayValue)
          );
        }),
        selectedDate,
        completions,
        !isViewingToday
      ),
    [todos, selectedDate, isViewingToday, todayValue, completions]
  );

  // One-off: a day-independent overview (always relative to today, not selectedDate) —
  // indefinite todos, plus anything due within the coming month (which also naturally
  // keeps overdue todos visible, since a past due date is <= the cutoff too).
  const oneOffOverview = useMemo(() => {
    const cutoff = new Date(`${todayValue}T00:00:00`);
    cutoff.setMonth(cutoff.getMonth() + 1);
    const cutoffValue = toDateString(cutoff);
    return todos.filter(
      (t) => !t.repeatDays?.length && (t.dueDate === null || t.dueDate <= cutoffValue)
    );
  }, [todos, todayValue]);

  const todosForDate = useMemo(
    () => [...dailyTodosForDate, ...oneOffOverview],
    [dailyTodosForDate, oneOffOverview]
  );
  const { result, sort, setSort, filter, setFilter } = useSortFilter(todosForDate);

  const { selectedTodo, select, clear } = useSelectedTodo(todos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  return (
    <TodoListPage
      heading={
        <>
          <button
            onClick={prevDay}
            className="text-zinc-400 hover:text-zinc-700 transition-colors leading-none"
            style={{ fontSize: "2rem" }}
          >
            ◀
          </button>
          <h1 className="text-xl font-semibold text-indigo-600">{dateLabel(selectedDate)}</h1>
          <button
            onClick={nextDay}
            className="text-zinc-400 hover:text-zinc-700 transition-colors leading-none"
            style={{ fontSize: "2rem" }}
          >
            ▶
          </button>
          {!isViewingToday && (
            <button
              onClick={goToday}
              className="ml-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Today
            </button>
          )}
        </>
      }
      todos={result}
      sort={sort}
      filter={filter}
      onSortChange={setSort}
      onFilterChange={setFilter}
      onSelect={select}
      emptyMessage="No todos yet."
      formKey={selectedDate}
      date={selectedDate}
      onClear={() => clearTodos(todosForDate.map((t) => t.id))}
      onReset={() => resetTodos(todosForDate.map((t) => t.id))}
      clearConfirmMessage="Delete every todo shown here? This can't be undone."
      footer={
        <section className="flex flex-col gap-3 mt-8">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed tasks</h2>
          <div className="flex gap-1">
            {(["day", "week"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setCompletedRange(r)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  completedRange === r
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {r === "day" ? "Today" : "This week"}
              </button>
            ))}
          </div>
          <pre className="border border-zinc-200 rounded-md p-3 text-xs text-zinc-700 whitespace-pre-wrap font-mono bg-zinc-50">
            {completedBlock}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="self-start text-xs bg-zinc-800 text-white rounded-md px-3 py-1.5 hover:bg-zinc-900 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleRefresh}
              className="self-start text-xs bg-zinc-800 text-white rounded-md px-3 py-1.5 hover:bg-zinc-900 transition-colors"
            >
              {refreshed ? "Refreshed!" : "Refresh"}
            </button>
            <button
              onClick={handleDayComplete}
              disabled={selectedDate > todayValue} // marking a future day would hide real gaps
              className="self-start text-xs bg-indigo-600 text-white rounded-md px-3 py-1.5 hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {dayMarked ? "Day marked ✓" : "Day Complete"}
            </button>
          </div>
        </section>
      }
    />
  );
}
