"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import TodoList from "@/app/components/TodoList";
import TodoDetail from "@/app/components/TodoDetail";
import TodoForm from "@/app/components/TodoForm";

export default function TagPage() {
  const { id } = useParams<{ id: string }>();
  const { todos, tags } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tag = tags.find((t) => t.id === id);
  const filtered = todos.filter((t) => t.tagIds.includes(id));
  const selectedTodo = filtered.find((t) => t.id === selectedId) ?? null;

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {tag && (
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
        )}
        <h1 className="text-xl font-semibold text-zinc-900">#{tag?.name ?? "Tag"}</h1>
      </div>
      <TodoForm />
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">No todos with this tag.</p>
      ) : (
        <TodoList todos={filtered} onSelect={(id) => setSelectedId(id)} />
      )}
    </div>
  );
}
