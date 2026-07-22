"use client";

import { useState, useRef, useEffect } from "react";

const COLOR_OPTIONS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

interface AddEntityFormProps {
  label: string;
  placeholder: string;
  onAdd: (name: string, color: string) => void;
}

export default function AddEntityForm({ label, placeholder, onAdd }: AddEntityFormProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function reset() {
    setName("");
    setColor(COLOR_OPTIONS[0]);
    setAdding(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    reset();
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="mt-1 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-slate-700 transition-colors w-full"
      >
        <span className="text-base leading-none">+</span> {label}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && reset()}
        placeholder={placeholder}
        className="text-sm text-zinc-900 border border-zinc-300 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400 transition-colors"
      />
      <div className="flex gap-1.5 flex-wrap">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-5 h-5 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-1 ring-zinc-400" : ""}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1 hover:bg-indigo-600 transition-colors">
          Add
        </button>
        <button type="button" onClick={reset} className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
