"use client";

import { useState } from "react";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import { todos } from "./lib/data";

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
