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
  lastCompletedDate?: string | null; // set when toggled to completed; used by rollover for repeat-only todos with no dueDate
}

interface List {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Completion {
  todoId: string;
  date: string;
}

interface DataContextValue {
  todos: Todo[];
  lists: List[];
  tags: Tag[];
  completions: Completion[];
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

function usePersistOnChange<T>(key: string, value: T, hydrated: boolean) {
  useEffect(() => {
    if (hydrated) save(key, value);
  }, [key, value, hydrated]);
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [lists, setLists] = useState<List[]>(initialLists);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const lastCheckedDateRef = useRef<string | null>(null);

  useEffect(() => {
    const today = todayStr();
    const storedTodos = rolloverTodos(load("todos", initialTodos), today);
    save("todos", storedTodos);
    setTodos(storedTodos);
    setLists(load("lists", initialLists));
    setTags(load("tags", initialTags));
    setCompletions(load("completions", [] as Completion[]));
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
    window.addEventListener("focus", checkRollover);
    window.addEventListener("pageshow", checkRollover);
    const intervalId = setInterval(checkRollover, 60 * 1000);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkRollover);
      window.removeEventListener("pageshow", checkRollover);
      clearInterval(intervalId);
    };
  }, [hydrated, checkRollover]);

  usePersistOnChange("todos", todos, hydrated);
  usePersistOnChange("lists", lists, hydrated);
  usePersistOnChange("tags", tags, hydrated);
  usePersistOnChange("completions", completions, hydrated);

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
    let justCompleted = false;
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const completed = !t.completed;
        justCompleted = completed;
        return { ...t, completed, lastCompletedDate: completed ? todayStr() : t.lastCompletedDate };
      })
    );
    if (justCompleted) {
      const today = todayStr();
      setCompletions((prev) =>
        prev.some((c) => c.todoId === id && c.date === today)
          ? prev
          : [...prev, { todoId: id, date: today }]
      );
    }
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
    <DataContext.Provider value={{ todos, lists, tags, completions, addTodo, addList, addTag, toggleTodo, updateTodo, deleteTodo, reorderTodos, updateList, deleteList, deleteTag }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
