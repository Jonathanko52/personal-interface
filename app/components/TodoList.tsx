"use client";

import { useData } from "@/app/lib/DataContext";

interface Todo {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
  completed: boolean;
  tagIds: string[];
}

interface TodoListProps {
  todos: Todo[];
  onSelect: (id: string) => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
  none: "bg-zinc-100 text-zinc-500",
};

export default function TodoList({ todos, onSelect }: TodoListProps) {
  const { toggleTodo, tags } = useData();

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => {
        const todoTags = tags.filter((t) => todo.tagIds.includes(t.id));
        return (
          <li
            key={todo.id}
            onClick={() => onSelect(todo.id)}
            className="flex items-center gap-3 bg-white border border-zinc-200 rounded-lg px-4 py-3 hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4 accent-indigo-500 shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={`text-sm ${todo.completed ? "line-through text-zinc-400" : "text-zinc-800"}`}>
              {todo.title}
            </span>
            {todoTags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            <span className="flex-1" />
            {todo.priority !== "none" && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityStyles[todo.priority]}`}>
                {todo.priority}
              </span>
            )}
            {todo.dueDate && (
              <span className="text-xs text-zinc-400 shrink-0">{todo.dueDate}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
