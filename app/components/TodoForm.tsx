"use client";

import { useState, useRef, useEffect } from "react";
import { useData } from "@/app/lib/DataContext";

interface TodoFormProps {
  defaultListId?: string;
}

export default function TodoForm({ defaultListId }: TodoFormProps) {
  const { lists, addTodo } = useData();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? "");
  const [priority, setPriority] = useState("none");
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !listId) return;
    addTodo({
      title: title.trim(),
      listId,
      priority,
      dueDate: dueDate || null,
      completed: false,
      tagIds: [],
      notes: "",
    });
    setTitle("");
    setPriority("none");
    setDueDate("");
    setExpanded(false);
  }

  function handleCancel() {
    setTitle("");
    setPriority("none");
    setDueDate("");
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg px-4 py-3 transition-colors mb-6"
      >
        <span className="text-base leading-none">+</span> Add todo
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-300 rounded-lg px-4 py-3 flex flex-col gap-3 mb-6"
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && handleCancel()}
        placeholder="Todo title"
        className="text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
      />
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={listId}
          onChange={(e) => setListId(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700"
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700"
        >
          {["none", "low", "medium", "high"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1 hover:bg-indigo-600 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
