"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { todos as initialTodos, lists as initialLists, tags as initialTags } from "./data";
import { today as todayStr } from "./date";
import { Priority } from "./priority";
import { rolloverTodos } from "./rollover";

export interface Todo {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  listId: string;
  tagIds: string[];
  repeatDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

interface List {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DataContextValue {
  todos: Todo[];
  lists: List[];
  tags: Tag[];
  addTodo: (todo: Omit<Todo, "id">) => void;
  addList: (list: Omit<List, "id">) => void;
  addTag: (tag: Omit<Tag, "id">) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, "id">>) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (activeId: string, overId: string) => void;
  updateList: (id: string, updates: Partial<Omit<List, "id">>) => void;
  deleteList: (id: string) => void;
  deleteTag: (id: string) => void;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [lists, setLists] = useState<List[]>(initialLists);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [hydrated, setHydrated] = useState(false);
  const lastCheckedDateRef = useRef<string | null>(null);

  useEffect(() => {
    const today = todayStr();
    const storedTodos = rolloverTodos(load("todos", initialTodos), today);
    save("todos", storedTodos);
    setTodos(storedTodos);
    setLists(load("lists", initialLists));
    setTags(load("tags", initialTags));
    lastCheckedDateRef.current = today;
    setHydrated(true);
  }, []);

  const checkRollover = useCallback(() => {
    const current = todayStr();
    if (lastCheckedDateRef.current === current) return;
    lastCheckedDateRef.current = current;
    setTodos((prev) => rolloverTodos(prev, current));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    function handleVisibility() {
      if (document.visibilityState === "visible") checkRollover();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    const intervalId = setInterval(checkRollover, 10 * 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(intervalId);
    };
  }, [hydrated, checkRollover]);

  useEffect(() => { if (hydrated) save("todos", todos); }, [todos, hydrated]);
  useEffect(() => { if (hydrated) save("lists", lists); }, [lists, hydrated]);
  useEffect(() => { if (hydrated) save("tags", tags); }, [tags, hydrated]);

  function addTodo(todo: Omit<Todo, "id">) {
    setTodos((prev) => [...prev, { ...todo, id: crypto.randomUUID() }]);
  }

  function addList(list: Omit<List, "id">) {
    setLists((prev) => [...prev, { ...list, id: crypto.randomUUID() }]);
  }

  function addTag(tag: Omit<Tag, "id">) {
    setTags((prev) => [...prev, { ...tag, id: crypto.randomUUID() }]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function updateTodo(id: string, updates: Partial<Omit<Todo, "id">>) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function reorderTodos(activeId: string, overId: string) {
    setTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }

  function updateList(id: string, updates: Partial<Omit<List, "id">>) {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }

  function deleteList(id: string) {
    setLists((prev) => prev.filter((l) => l.id !== id));
    setTodos((prev) => prev.filter((t) => t.listId !== id));
  }

  function deleteTag(id: string) {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setTodos((prev) => prev.map((t) => ({ ...t, tagIds: t.tagIds.filter((tid) => tid !== id) })));
  }

  return (
    <DataContext.Provider value={{ todos, lists, tags, addTodo, addList, addTag, toggleTodo, updateTodo, deleteTodo, reorderTodos, updateList, deleteList, deleteTag }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
