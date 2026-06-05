"use client";

import { useState } from "react";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";

const todos = [
  { id: "1", title: "Review project proposal", priority: "high", dueDate: "2026-06-06", completed: false },
  { id: "2", title: "Buy groceries", priority: "low", dueDate: "2026-06-05", completed: false },
  { id: "3", title: "Schedule dentist appointment", priority: "medium", dueDate: "2026-06-07", completed: false },
  { id: "4", title: "Read chapter 3", priority: "none", dueDate: null, completed: true },
];

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Today</h1>
      <TodoList todos={todos} onSelect={(id) => setSelectedId(id)} />
    </div>
  );
}
