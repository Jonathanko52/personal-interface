"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableTodo({ todo, onSelect }: { todo: Todo; onSelect: (id: string) => void }) {
  const { toggleTodo, tags } = useData();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const todoTags = tags.filter((t) => todo.tagIds.includes(t.id));

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-3 bg-white border border-zinc-200 rounded-lg px-4 py-3 transition-colors cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 border-indigo-300 shadow-md" : "hover:border-zinc-300"
      }`}
      {...attributes}
      {...listeners}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-4 h-4 accent-indigo-500 shrink-0"
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
      <button
        onClick={() => onSelect(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
      >
        Edit
      </button>
    </li>
  );
}

export default function TodoList({ todos, onSelect }: TodoListProps) {
  const { reorderTodos } = useData();

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTodos(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <SortableTodo key={todo.id} todo={todo} onSelect={onSelect} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
