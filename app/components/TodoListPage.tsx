"use client";

import { ReactNode, useState } from "react";
import TodoForm from "./TodoForm";
import SortFilterBar from "./SortFilterBar";
import GroupedTodoList from "./GroupedTodoList";
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
  onClear?: () => void;
  onReset?: () => void;
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
  onClear,
  onReset,
}: TodoListPageProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">{heading}</div>
      <TodoForm key={defaultListId} defaultListId={defaultListId} />
      <div className="flex items-center justify-between gap-2">
        <SortFilterBar sort={sort} filter={filter} onSortChange={onSortChange} onFilterChange={onFilterChange} />
        {(onClear || onReset) && (
          <div className="flex gap-3 shrink-0">
            {onReset && (
              <button
                onClick={onReset}
                className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                Reset
              </button>
            )}
            {onClear && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
      {todos.length === 0 ? (
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      ) : (
        <GroupedTodoList todos={todos} onSelect={onSelect} dragEnabled={sort === "default"} />
      )}

      {showConfirmClear && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowConfirmClear(false)}
        >
          <div
            className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col gap-4 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-zinc-700">Delete every todo in this list? This can&apos;t be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-2 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClear?.();
                  setShowConfirmClear(false);
                }}
                className="text-xs bg-red-500 text-white rounded-md px-3 py-1.5 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
