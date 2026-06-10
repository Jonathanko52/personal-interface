"use client";

"use client";

import { useState } from "react";
import { useData, Todo } from "@/app/lib/DataContext";

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
}

const priorityOptions = ["none", "low", "medium", "high"];

export default function TodoDetail({ todo, onClose }: TodoDetailProps) {
  const { updateTodo, deleteTodo, tags } = useData();
  const todoTags = tags.filter((tag) => todo.tagIds.includes(tag.id));
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes);

  function handleDelete() {
    deleteTodo(todo.id);
    onClose();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            ← Back
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => updateTodo(todo.id, { title })}
            className="flex-1 text-xl font-semibold text-zinc-900 outline-none border-b border-transparent focus:border-zinc-300 pb-1 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateTodo(todo.id, { notes })}
            placeholder="Add notes..."
            className="text-sm text-zinc-700 outline-none border border-zinc-200 rounded-md p-2 resize-none focus:border-zinc-400 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((p) => (
              <button
                key={p}
                onClick={() => updateTodo(todo.id, { priority: p })}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  todo.priority === p
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Due Date
          </label>
          <input
            type="date"
            defaultValue={todo.dueDate ?? ""}
            onChange={(e) =>
              updateTodo(todo.id, { dueDate: e.target.value || null })
            }
            className="text-sm text-zinc-700 border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-400 transition-colors w-fit"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Tags
          </label>
          <div className="flex gap-2 flex-wrap">
            {todoTags.length === 0 ? (
              <span className="text-xs text-zinc-400">No tags</span>
            ) : (
              todoTags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="self-start text-xs text-red-500 hover:text-red-700 transition-colors mt-2">
          Delete todo
        </button>
      </div>
    </div>
  );
}
