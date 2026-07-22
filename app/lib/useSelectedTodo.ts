"use client";

import { useState } from "react";
import { Todo } from "./DataContext";

export function useSelectedTodo(todos: Todo[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  return {
    selectedTodo,
    select: (id: string) => setSelectedId(id),
    clear: () => setSelectedId(null),
  };
}
