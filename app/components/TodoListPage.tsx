"use client";

import { ReactNode, useState } from "react";
import TodoForm from "./TodoForm";
import SortFilterBar from "./SortFilterBar";
import GroupedTodoList from "./GroupedTodoList";
import ConfirmDialog from "./ConfirmDialog";
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
  formKey?: string;
  dailyReadOnly?: boolean;
  footer?: ReactNode;
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
  formKey,
  dailyReadOnly,
  footer,
  onClear,
  onReset,
}: TodoListPageProps) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">{heading}</div>
      <TodoForm key={formKey ?? defaultListId} defaultListId={defaultListId} />
      <div className="flex items-center justify-between gap-2">
        <SortFilterBar
          sort={sort}
          filter={filter}
          onSortChange={onSortChange}
          onFilterChange={onFilterChange}
        />
        {(onClear || onReset) && (
          <div className="flex gap-3 shrink-0">
            {onReset && (
              <button
                onClick={onReset}
                className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors">
                Reset
              </button>
            )}
            {onClear && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                Clear
              </button>
            )}
          </div>
        )}
      </div>
      {todos.length === 0 ? (
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      ) : (
        <GroupedTodoList
          todos={todos}
          onSelect={onSelect}
          dragEnabled={sort === "default"}
          dailyReadOnly={dailyReadOnly}
        />
      )}

      {footer}

      {showConfirmClear && (
        <ConfirmDialog
          theme="light"
          onDismiss={() => setShowConfirmClear(false)}>
          <p className="text-sm text-zinc-700">
            Delete every todo in this list? This can&apos;t be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowConfirmClear(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors px-2 py-1.5">
              Cancel
            </button>
            <button
              onClick={() => {
                onClear?.();
                setShowConfirmClear(false);
              }}
              className="text-xs bg-red-500 text-white rounded-md px-3 py-1.5 hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
