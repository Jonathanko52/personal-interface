"use client";

import { useState, useRef } from "react";

type Filter = "all" | "active" | "completed";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const nextId = useRef(1);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: nextId.current++, text, completed: false }]);
    setInput("");
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  function commitEdit(id: number) {
    const text = editText.trim();
    if (text) {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    }
    setEditingId(null);
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-8 tracking-tight">
          todos
        </h1>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-gray-100 placeholder-gray-400"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-sm transition-colors"
          >
            Add
          </button>
        </div>

        {/* List */}
        {todos.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 px-4 py-3 group">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                    }`}
                    aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>

                  {editingId === todo.id ? (
                    <input
                      autoFocus
                      className="flex-1 text-sm bg-transparent border-b border-indigo-400 focus:outline-none dark:text-gray-100"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(todo.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => commitEdit(todo.id)}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(todo)}
                      className={`flex-1 text-sm cursor-default select-none ${
                        todo.completed
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-red-500 transition-all text-lg leading-none"
                    aria-label="Delete todo"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <span>{activeCount} item{activeCount !== 1 ? "s" : ""} left</span>

              <div className="flex gap-1">
                {(["all", "active", "completed"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-1 rounded-md capitalize transition-colors ${
                      filter === f
                        ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={clearCompleted}
                className="hover:text-red-500 transition-colors disabled:opacity-30"
                disabled={todos.every((t) => !t.completed)}
              >
                Clear completed
              </button>
            </div>
          </div>
        )}

        {todos.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 mt-8">
            No todos yet — add one above!
          </p>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Double-click a todo to edit it
        </p>
      </div>
    </div>
  );
}
