"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GroupedTodoList from "./components/GroupedTodoList";
import TodoDetail from "./components/TodoDetail";
import TodoForm from "./components/TodoForm";
import SortFilterBar from "./components/SortFilterBar";
import { useData } from "./lib/DataContext";
import { useSortFilter } from "./lib/useSortFilter";
import { useSelectedTodo } from "./lib/useSelectedTodo";
import { today as todayStr, toDateString } from "./lib/date";

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
  const { todos } = useData();
  const [selectedDate, setSelectedDate] = useState(todayStr());

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

  const todosForDate = todos.filter((t) => t.dueDate === null || t.dueDate >= selectedDate);
  const { result, sort, setSort, filter, setFilter } = useSortFilter(todosForDate);

  const { selectedTodo, select, clear } = useSelectedTodo(todos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  const isToday = selectedDate === todayStr();

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
        {!isToday && (
          <button
            onClick={goToday}
            className="ml-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Today
          </button>
        )}
      </div>
      <TodoForm key={selectedDate} defaultDueDate={selectedDate} />
      <SortFilterBar sort={sort} filter={filter} onSortChange={setSort} onFilterChange={setFilter} />
      <GroupedTodoList todos={result} onSelect={select} />
    </div>
  );
}
