"use client";

import { useState, useRef, useEffect } from "react";
import { useData } from "@/app/lib/DataContext";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface TodoFormProps {
  defaultListId?: string;
  defaultDueDate?: string;
}

export default function TodoForm({ defaultListId, defaultDueDate }: TodoFormProps) {
  const { lists, tags, addTodo } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [priority, setPriority] = useState("none");
  const [dueDate, setDueDate] = useState(defaultDueDate ?? today);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function toggleRepeatDay(day: number) {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !listId) return;
    addTodo({
      title: title.trim(),
      listId,
      priority,
      dueDate: dueDate || null,
      completed: false,
      tagIds: selectedTagIds,
      notes: "",
      repeatDays,
    });
    setTitle("");
    setPriority("none");
    setDueDate(defaultDueDate ?? today);
    setSelectedTagIds([]);
    setRepeatDays([]);
    setExpanded(false);
  }

  function handleCancel() {
    setTitle("");
    setPriority("none");
    setDueDate(defaultDueDate ?? today);
    setSelectedTagIds([]);
    setRepeatDays([]);
    setExpanded(false);
  }

  if (lists.length === 0) {
    return (
      <p className="text-sm text-zinc-400 mb-6">
        Create a list in the sidebar before adding todos.
      </p>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 transition-colors mb-6">
        <span className="text-base leading-none">+</span> Add todo
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 flex flex-col gap-3 mb-6">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && handleCancel()}
        placeholder="Todo title"
        className="text-sm text-slate-100 outline-none placeholder:text-slate-500 bg-transparent"
      />
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={listId}
          onChange={(e) => setListId(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white">
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white">
          {["none", "low", "medium", "high"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-slate-400">Repeat</span>
        <div className="flex gap-1">
          {DAYS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleRepeatDay(i)}
              className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
                repeatDays.includes(i)
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedTagIds.includes(tag.id)
                  ? "text-white border-transparent"
                  : "border-slate-600 text-slate-400 hover:border-slate-400"
              }`}
              style={
                selectedTagIds.includes(tag.id)
                  ? { backgroundColor: tag.color, borderColor: tag.color }
                  : {}
              }>
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1 hover:bg-indigo-600 transition-colors">
          Add
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs text-slate-400 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
