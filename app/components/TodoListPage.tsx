"use client";

import { ReactNode } from "react";
import TodoForm from "./TodoForm";
import SortFilterBar from "./SortFilterBar";
import TodoList from "./TodoList";
import { SortOption, FilterOption } from "@/app/lib/useSortFilter";
import { Todo } from "@/app/lib/DataContext";

interface TodoListPageProps {
  heading: ReactNode;
  todos: Todo[];
  sort: SortOption;
  filter: FilterOption;
  onSortChange: (s: SortOption) => void;
  onFilterChange: (f: FilterOption) => void;
  onSelect: (id: string) => void;
  emptyMessage: string;
  defaultListId?: string;
}

export default function TodoListPage({
  heading,
  todos,
  sort,
  filter,
  onSortChange,
  onFilterChange,
  onSelect,
  emptyMessage,
  defaultListId,
}: TodoListPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">{heading}</div>
      <TodoForm defaultListId={defaultListId} />
      <SortFilterBar sort={sort} filter={filter} onSortChange={onSortChange} onFilterChange={onFilterChange} />
      {todos.length === 0 ? (
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      ) : (
        <TodoList todos={todos} onSelect={onSelect} />
      )}
    </div>
  );
}
