"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useData } from "@/app/lib/DataContext";

const COLOR_OPTIONS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

export default function Sidebar() {
  const pathname = usePathname();
  const { lists, tags, addList } = useData();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addList({ name: name.trim(), color });
    setName("");
    setColor(COLOR_OPTIONS[0]);
    setAdding(false);
  }

  function handleCancel() {
    setName("");
    setColor(COLOR_OPTIONS[0]);
    setAdding(false);
  }

  const linkClass = (href: string) =>
    `flex items-center gap-2 text-sm rounded-md px-3 py-2 transition-colors ${
      pathname === href
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
    }`;

  return (
    <nav className="w-60 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <Link href="/" className={linkClass("/")}>
          Today
        </Link>
        <Link href="/month" className={linkClass("/month")}>
          Month
        </Link>
      </div>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Lists
        </p>
        <ul className="flex flex-col gap-1">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/list/${list.id}`} className={linkClass(`/list/${list.id}`)}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: list.color }} />
                {list.name}
              </Link>
            </li>
          ))}
        </ul>

        {adding ? (
          <form onSubmit={handleSubmit} className="mt-2 px-3 flex flex-col gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && handleCancel()}
              placeholder="List name"
              className="text-sm border border-zinc-300 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400 transition-colors"
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
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors w-full"
          >
            <span className="text-base leading-none">+</span> New list
          </button>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Tags
        </p>
        <ul className="flex flex-col gap-1">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link href={`/tags/${tag.id}`} className={linkClass(`/tags/${tag.id}`)}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </nav>
  );
}
