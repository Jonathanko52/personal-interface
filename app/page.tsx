"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import GroupedTodoList from "./components/GroupedTodoList";
import TodoDetail from "./components/TodoDetail";
import TodoForm from "./components/TodoForm";
import SortFilterBar from "./components/SortFilterBar";
import { useData } from "./lib/DataContext";
import { useSortFilter } from "./lib/useSortFilter";
import { useSelectedTodo } from "./lib/useSelectedTodo";
import { today as todayStr, toDateString } from "./lib/date";
import { completedTasks, uncompletedTasksToday, formatTasksSummaryBlock, CompletionRange } from "./lib/completionStats";

function dateLabel(dateStr: string): string {
  const today = todayStr();
  const d = new Date(dateStr + "T12:00:00");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today) return "Today";
  if (dateStr === toDateString(tomorrow)) return "Tomorrow";
  if (dateStr === toDateString(yesterday)) return "Yesterday";
  return d.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" });
}

export default function Home() {
  const router = useRouter();
  const { todos, completions } = useData();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [completedRange, setCompletedRange] = useState<CompletionRange>("day");
  const [copied, setCopied] = useState(false);

  const completedBlock = useMemo(() => {
    const completed = completedTasks(completions, todos, completedRange);
    const uncompleted = uncompletedTasksToday(todos);
    return formatTasksSummaryBlock(completed, uncompleted, completedRange);
  }, [completions, todos, completedRange]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(completedBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the text
      // block is still visible below for the user to select and copy manually.
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const date = params.get("date");
    if (date) setSelectedDate(date);
  }, []);

  function prevDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    const next = toDateString(d);
    setSelectedDate(next);
    router.replace(`/?date=${next}`);
  }

  function nextDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const next = toDateString(d);
    setSelectedDate(next);
    router.replace(`/?date=${next}`);
  }

  function goToday() {
    setSelectedDate(todayStr());
    router.replace("/");
  }

  const isViewingToday = selectedDate === todayStr();
  const todosForDate = todos.filter(
    (t) =>
      t.dueDate === null ||
      t.dueDate === selectedDate ||
      (isViewingToday && !t.completed) ||
      (isViewingToday && t.lastCompletedDate === todayStr())
  );
  const { result, sort, setSort, filter, setFilter } = useSortFilter(todosForDate);

  const { selectedTodo, select, clear } = useSelectedTodo(todos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
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
      </div>
      <TodoForm key={selectedDate} />
      <SortFilterBar sort={sort} filter={filter} onSortChange={setSort} onFilterChange={setFilter} />
      <GroupedTodoList todos={result} onSelect={select} dragEnabled={sort === "default"} />

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
        <button
          onClick={handleCopy}
          className="self-start text-xs bg-zinc-800 text-white rounded-md px-3 py-1.5 hover:bg-zinc-900 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </section>
    </div>
  );
}
