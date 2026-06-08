"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import { useSortFilter } from "@/app/lib/useSortFilter";
import TodoList from "@/app/components/TodoList";
import TodoDetail from "@/app/components/TodoDetail";
import TodoForm from "@/app/components/TodoForm";
import SortFilterBar from "@/app/components/SortFilterBar";

export default function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { todos, lists } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = lists.find((l) => l.id === id);
  const listTodos = todos.filter((t) => t.listId === id);
  const { result, sort, setSort, filter, setFilter } = useSortFilter(listTodos);
  const selectedTodo = listTodos.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {list && (
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: list.color }} />
        )}
        <h1 className="text-xl font-semibold text-zinc-900">{list?.name ?? "List"}</h1>
      </div>
      <TodoForm defaultListId={id} />
      <SortFilterBar sort={sort} filter={filter} onSortChange={setSort} onFilterChange={setFilter} />
      {result.length === 0 ? (
        <p className="text-sm text-zinc-400">No todos in this list.</p>
      ) : (
        <TodoList todos={result} onSelect={(id) => setSelectedId(id)} />
      )}
    </div>
  );
}
