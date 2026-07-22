"use client";

import { useParams } from "next/navigation";
import { useData } from "@/app/lib/DataContext";
import { useSortFilter } from "@/app/lib/useSortFilter";
import { useSelectedTodo } from "@/app/lib/useSelectedTodo";
import TodoDetail from "@/app/components/TodoDetail";
import TodoListPage from "@/app/components/TodoListPage";

export default function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { todos, lists } = useData();

  const list = lists.find((l) => l.id === id);
  const listTodos = todos.filter((t) => t.listId === id);
  const { result, sort, setSort, filter, setFilter } = useSortFilter(listTodos);
  const { selectedTodo, select, clear } = useSelectedTodo(listTodos);

  if (selectedTodo) {
    return <TodoDetail todo={selectedTodo} onClose={clear} />;
  }

  return (
    <TodoListPage
      heading={
        <>
          {list && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: list.color }} />}
          <h1 className="text-xl font-semibold text-zinc-900">{list?.name ?? "List"}</h1>
        </>
      }
      todos={result}
      sort={sort}
      filter={filter}
      onSortChange={setSort}
      onFilterChange={setFilter}
      onSelect={select}
      emptyMessage="No todos in this list."
      defaultListId={id}
    />
  );
}
