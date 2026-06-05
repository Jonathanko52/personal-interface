"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { todos as initialTodos, lists as initialLists, tags as initialTags } from "./data";

interface Todo {
  id: string;
  title: string;
  notes: string;
  priority: string;
  dueDate: string | null;
  completed: boolean;
  listId: string;
  tagIds: string[];
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
  toggleTodo: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [lists, setLists] = useState<List[]>(initialLists);
  const [tags] = useState<Tag[]>(initialTags);

  function addTodo(todo: Omit<Todo, "id">) {
    setTodos((prev) => [...prev, { ...todo, id: crypto.randomUUID() }]);
  }

  function addList(list: Omit<List, "id">) {
    setLists((prev) => [...prev, { ...list, id: crypto.randomUUID() }]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  return (
    <DataContext.Provider value={{ todos, lists, tags, addTodo, addList, toggleTodo }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
