"use client";

import TodoList from "./TodoList";
import { groupByRepeat } from "@/app/lib/groupTodos";
import { Todo } from "@/app/lib/DataContext";

interface GroupedTodoListProps {
  todos: Todo[];
  onSelect: (id: string) => void;
}

export default function GroupedTodoList({ todos, onSelect }: GroupedTodoListProps) {
  const { repeating, oneOff } = groupByRepeat(todos);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Tasks</h2>
        {repeating.length === 0 ? (
          <p className="text-sm text-zinc-400">No daily tasks.</p>
        ) : (
          <TodoList todos={repeating} onSelect={onSelect} />
        )}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">One-off</h2>
        {oneOff.length === 0 ? (
          <p className="text-sm text-zinc-400">No one-off todos.</p>
        ) : (
          <TodoList todos={oneOff} onSelect={onSelect} />
        )}
      </section>
    </div>
  );
}
