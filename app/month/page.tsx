"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import { useSelectedTodo } from "@/app/lib/useSelectedTodo";
import { priorityDotColors } from "@/app/lib/priority";
import { overrideCompletedFromLog } from "@/app/lib/completionStats";
import { occursOn } from "@/app/lib/rollover";
import { toDateString, today } from "@/app/lib/date";
import TodoDetail from "@/app/components/TodoDetail";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthPage() {
  const router = useRouter();
  const { todos, completions } = useData();
  const now = new Date();
  const todayStr = today();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { selectedTodo, select, clear } = useSelectedTodo(todos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  // Date handles the year rollover (month -1 → December of the year before, 12 → January after).
  function stepMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  // Shared date helpers (Part 119) instead of hand-built YYYY-MM-DD strings.
  const dateStrFor = (day: number) => toDateString(new Date(year, month, day));

  function todosForDay(day: number) {
    const dateStr = dateStrFor(day);
    return overrideCompletedFromLog(
      todos.filter((t) => t.dueDate === dateStr || occursOn(t.repeatDays ?? [], dateStr)),
      dateStr,
      completions,
      !isToday(day)
    );
  }

  const isToday = (day: number) => dateStrFor(day) === todayStr;

  type Cell = { key: string; empty: true } | { key: string; empty: false; day: number };
  const cells: Cell[] = [
    ...Array.from({ length: firstDay }, (_, i): Cell => ({ key: `empty-${i}`, empty: true })),
    ...Array.from({ length: daysInMonth }, (_, i): Cell => ({ key: `day-${i + 1}`, empty: false, day: i + 1 })),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-100">{monthLabel}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => stepMonth(-1)}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => stepMonth(1)}
            className="text-sm px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-slate-800 transition-colors"
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
              onClick={() => router.push(`/?date=${dateStrFor(cell.day)}`)}
              className="border-r border-b border-zinc-200 bg-white min-h-24 p-1.5 flex flex-col gap-1 cursor-pointer hover:bg-zinc-50 transition-colors"
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full self-start ${
                  isToday(cell.day)
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-600"
                }`}
              >
                {cell.day}
              </span>
              {todosForDay(cell.day).map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => select(todo.id)}
                  className={`flex items-center gap-1.5 text-left w-full rounded px-1.5 py-0.5 hover:bg-zinc-100 transition-colors ${
                    todo.completed ? "opacity-40" : ""
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDotColors[todo.priority]}`} />
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
