"use client";

import { useState, useMemo } from "react";
import { Todo } from "./DataContext";

export type SortOption = "default" | "due-date" | "priority";
export type FilterOption = "all" | "active" | "completed";

const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };

export function useSortFilter(todos: Todo[]) {
  const [sort, setSort] = useState<SortOption>("default");
  const [filter, setFilter] = useState<FilterOption>("all");

  const result = useMemo(() => {
    let items = [...todos];

    if (filter === "active") items = items.filter((t) => !t.completed);
    if (filter === "completed") items = items.filter((t) => t.completed);

    if (sort === "due-date") {
      items.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sort === "priority") {
      items.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    }

    return items;
  }, [todos, sort, filter]);

  return { result, sort, setSort, filter, setFilter };
}
