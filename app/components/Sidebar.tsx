"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useData } from "@/app/lib/DataContext";

const COLOR_OPTIONS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

interface SidebarProps {
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function Sidebar({ panelOpen, onTogglePanel }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lists, tags, addList, updateList, deleteList, deleteTag } = useData();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const addInputRef = useRef<HTMLInputElement>(null);

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (editingListId) editInputRef.current?.focus();
  }, [editingListId]);

  function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) return;
    addList({ name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor(COLOR_OPTIONS[0]);
    setAdding(false);
  }

  function handleAddCancel() {
    setNewName("");
    setNewColor(COLOR_OPTIONS[0]);
    setAdding(false);
  }

  function startEditList(id: string, name: string) {
    setEditingListId(id);
    setEditingListName(name);
  }

  function commitEditList(id: string) {
    if (editingListName.trim()) updateList(id, { name: editingListName.trim() });
    setEditingListId(null);
  }

  function handleDeleteList(id: string) {
    deleteList(id);
    if (pathname === `/list/${id}`) router.push("/");
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
        <Link href="/" className={linkClass("/")}>Today</Link>
        <Link href="/month" className={linkClass("/month")}>Month</Link>
        <button
          onClick={onTogglePanel}
          className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 transition-colors text-left ${
            panelOpen
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Tools
        </button>
      </div>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">Lists</p>
        <ul className="flex flex-col gap-1">
          {lists.map((list) => (
            <li key={list.id} className="group flex items-center gap-1">
              {editingListId === list.id ? (
                <input
                  ref={editInputRef}
                  value={editingListName}
                  onChange={(e) => setEditingListName(e.target.value)}
                  onBlur={() => commitEditList(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEditList(list.id);
                    if (e.key === "Escape") setEditingListId(null);
                  }}
                  className="flex-1 text-sm border border-zinc-300 rounded-md px-2 py-1 outline-none focus:border-indigo-400 mx-1"
                />
              ) : (
                <Link
                  href={`/list/${list.id}`}
                  className={`flex-1 ${linkClass(`/list/${list.id}`)}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: list.color }} />
                  {list.name}
                </Link>
              )}
              <div className="hidden group-hover:flex items-center gap-0.5 pr-1">
                <button
                  onClick={() => startEditList(list.id, list.name)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs px-1"
                  title="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="text-zinc-400 hover:text-red-500 text-xs px-1"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>

        {adding ? (
          <form onSubmit={handleAddSubmit} className="mt-2 px-3 flex flex-col gap-2">
            <input
              ref={addInputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && handleAddCancel()}
              placeholder="List name"
              className="text-sm border border-zinc-300 rounded-md px-2 py-1.5 outline-none focus:border-indigo-400 transition-colors"
            />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-1 ring-zinc-400" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="text-xs bg-indigo-500 text-white rounded-md px-3 py-1 hover:bg-indigo-600 transition-colors">Add</button>
              <button type="button" onClick={handleAddCancel} className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">Cancel</button>
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
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">Tags</p>
        <ul className="flex flex-col gap-1">
          {tags.map((tag) => (
            <li key={tag.id} className="group flex items-center gap-1">
              <Link href={`/tags/${tag.id}`} className={`flex-1 ${linkClass(`/tags/${tag.id}`)}`}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </Link>
              <button
                onClick={() => deleteTag(tag.id)}
                className="hidden group-hover:block text-zinc-400 hover:text-red-500 text-xs px-1 pr-2"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

    </nav>
  );
}
