"use client";

import { useParams } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import { useSortFilter } from "@/app/lib/useSortFilter";
import { useSelectedTodo } from "@/app/lib/useSelectedTodo";
import TodoDetail from "@/app/components/TodoDetail";
import TodoListPage from "@/app/components/TodoListPage";

export default function TagPage() {
  const { id } = useParams<{ id: string }>();
  const { todos, tags } = useData();

  const tag = tags.find((t) => t.id === id);
  const tagTodos = todos.filter((t) => t.tagIds.includes(id));
  const { result, sort, setSort, filter, setFilter } = useSortFilter(tagTodos);
  const { selectedTodo, select, clear } = useSelectedTodo(tagTodos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  return (
    <TodoListPage
      heading={
        <>
          {tag && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />}
          <h1 className="text-xl font-semibold text-zinc-900">#{tag?.name ?? "Tag"}</h1>
        </>
      }
      todos={result}
      sort={sort}
      filter={filter}
      onSortChange={setSort}
      onFilterChange={setFilter}
      onSelect={select}
      emptyMessage="No todos with this tag."
    />
  );
}
