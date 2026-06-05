"use client";

import { useState } from "react";
import { useData } from "@/app/lib/DataContext";
import TodoDetail from "@/app/components/TodoDetail";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityColors: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  none: "bg-zinc-300",
};

export default function MonthPage() {
  const { todos } = useData();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function todosForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return todos.filter((t) => t.dueDate === dateStr);
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = Array.from({ length: firstDay }, (_, i) => ({ key: `empty-${i}`, empty: true }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ key: `day-${i + 1}`, day: i + 1, empty: false })));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">{monthLabel}</h1>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-semibold text-zinc-400 text-center py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-t border-zinc-200">
        {cells.map((cell) =>
          cell.empty ? (
            <div key={cell.key} className="border-r border-b border-zinc-200 bg-zinc-50 min-h-24" />
          ) : (
            <div
              key={cell.key}
              className="border-r border-b border-zinc-200 bg-white min-h-24 p-1.5 flex flex-col gap-1"
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-start ${
                  isToday(cell.day!)
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-600"
                }`}
              >
                {cell.day}
              </span>
              {todosForDay(cell.day!).map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => setSelectedId(todo.id)}
                  className={`flex items-center gap-1.5 text-left w-full rounded px-1.5 py-0.5 hover:bg-zinc-100 transition-colors ${
                    todo.completed ? "opacity-40" : ""
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColors[todo.priority]}`} />
                  <span className="text-xs text-zinc-700 truncate">{todo.title}</span>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
