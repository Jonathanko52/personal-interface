"use client";

import { useState } from "react";
import { useData, Todo } from "@/app/lib/DataContext";

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
}

const priorityOptions = ["none", "low", "medium", "high"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function TodoDetail({ todo, onClose }: TodoDetailProps) {
  const { updateTodo, deleteTodo, tags } = useData();
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes);

  function handleDelete() {
    deleteTodo(todo.id);
    onClose();
  }

  function toggleTag(tagId: string) {
    const updated = todo.tagIds.includes(tagId)
      ? todo.tagIds.filter((id) => id !== tagId)
      : [...todo.tagIds, tagId];
    updateTodo(todo.id, { tagIds: updated });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
          >
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
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notes</label>
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
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</label>
          <div className="flex gap-2">
            {priorityOptions.map((p) => (
              <button
                key={p}
                onClick={() => updateTodo(todo.id, { priority: p })}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  todo.priority === p
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Due Date</label>
          <input
            type="date"
            defaultValue={todo.dueDate ?? ""}
            onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value || null })}
            className="text-sm text-zinc-700 border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-400 transition-colors w-fit"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tags</label>
          {tags.length === 0 ? (
            <span className="text-xs text-zinc-400">No tags available — create one in Navigation.</span>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => {
                const active = todo.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      active ? "text-white border-transparent" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                    }`}
                    style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Repeat</label>
          <div className="flex gap-1">
            {DAYS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const current = todo.repeatDays ?? [];
                  const updated = current.includes(i)
                    ? current.filter((d) => d !== i)
                    : [...current, i];
                  updateTodo(todo.id, { repeatDays: updated });
                }}
                className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
                  (todo.repeatDays ?? []).includes(i)
                    ? "bg-indigo-500 text-white"
                    : "border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="self-start text-xs text-red-500 hover:text-red-700 transition-colors mt-2"
        >
          Delete todo
        </button>
      </div>
    </div>
  );
}
