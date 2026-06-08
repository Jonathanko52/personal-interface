"use client";

import { useState } from "react";
import TodoList from "./components/TodoList";
import TodoDetail from "./components/TodoDetail";
import TodoForm from "./components/TodoForm";
import SortFilterBar from "./components/SortFilterBar";
import { useData } from "./lib/DataContext";
import { useSortFilter } from "./lib/useSortFilter";

export default function Home() {
  const { todos } = useData();
  const { result, sort, setSort, filter, setFilter } = useSortFilter(todos);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Today</h1>
      <TodoForm />
      <SortFilterBar sort={sort} filter={filter} onSortChange={setSort} onFilterChange={setFilter} />
      <TodoList todos={result} onSelect={(id) => setSelectedId(id)} />
    </div>
  );
}
