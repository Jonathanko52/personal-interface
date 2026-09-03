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
import { useData, Todo as FullTodo } from "@/app/lib/DataContext";
import { priorityBadgeStyles } from "@/app/lib/priority";
import { weightBadgeStyles } from "@/app/lib/weight";
import { today as todayStr } from "@/app/lib/date";

type Todo = Pick<FullTodo, "id" | "title" | "priority" | "weight" | "dueDate" | "completed" | "tagIds">;

interface TodoListProps {
  todos: Todo[];
  onSelect: (id: string) => void;
  dragEnabled?: boolean;
  readOnly?: boolean;
}

function SortableTodo({
  todo,
  onSelect,
  dragEnabled,
  readOnly,
}: {
  todo: Todo;
  onSelect: (id: string) => void;
  dragEnabled: boolean;
  readOnly?: boolean;
}) {
  const { toggleTodo, tags } = useData();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: !dragEnabled });

  const todoTags = tags.filter((t) => todo.tagIds.includes(t.id));
  const isOverdue = !!todo.dueDate && todo.dueDate < todayStr() && !todo.completed;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => !readOnly && toggleTodo(todo.id)}
      className={`group flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 transition-colors ${
        dragEnabled ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-50 border-indigo-400 shadow-md" : "hover:border-slate-600"}`}
      {...attributes}
      {...listeners}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => !readOnly && toggleTodo(todo.id)}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={readOnly}
        className="w-4 h-4 accent-indigo-500 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <span
        className={`text-sm ${
          todo.completed ? "line-through text-slate-500" : isOverdue ? "text-red-400" : "text-slate-100"
        }`}
      >
        {todo.title}
        {isOverdue && " (OVERDUE)"}
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${priorityBadgeStyles[todo.priority]}`}>
          {todo.priority}
        </span>
      )}
      {todo.weight !== null && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${weightBadgeStyles[todo.weight]}`}>
          {todo.weight}
        </span>
      )}
      {todo.dueDate && (
        <span className="text-xs text-slate-400 shrink-0">{todo.dueDate}</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(todo.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
      >
        Edit
      </button>
    </li>
  );
}

export default function TodoList({ todos, onSelect, dragEnabled = true, readOnly }: TodoListProps) {
  const { reorderTodos } = useData();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

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
            <SortableTodo key={todo.id} todo={todo} onSelect={onSelect} dragEnabled={dragEnabled} readOnly={readOnly} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
