"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import TodoForm from "./components/TodoForm";
import SortFilterBar from "./components/SortFilterBar";
import { useData } from "./lib/DataContext";
import { useSortFilter } from "./lib/useSortFilter";

function dateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const d = new Date(dateStr + "T12:00:00");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Tomorrow";
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return d.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" });
}

export default function Home() {
  const router = useRouter();
  const { todos } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const date = params.get("date");
    if (date) setSelectedDate(date);
  }, []);

  function prevDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    const next = d.toISOString().slice(0, 10);
    setSelectedDate(next);
    router.replace(`/?date=${next}`);
  }

  function nextDay() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().slice(0, 10);
    setSelectedDate(next);
    router.replace(`/?date=${next}`);
  }

  function goToday() {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    router.replace("/");
  }

  const todosForDate = todos.filter((t) => t.dueDate === selectedDate);
  const { result, sort, setSort, filter, setFilter } = useSortFilter(todosForDate);

  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
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
      <TodoList todos={result} onSelect={(id) => setSelectedId(id)} />
    </div>
  );
}
