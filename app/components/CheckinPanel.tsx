"use client";

import { useState, useRef, useEffect } from "react";
import { useData } from "@/app/lib/DataContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function CheckinPanel() {
  const { todos } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          todos: todos.map((t) => ({
            title: t.title,
            completed: t.completed,
            priority: t.priority,
            dueDate: t.dueDate,
          })),
        }),
      });
      if (!res.ok) throw new Error(`Check-in failed (${res.status})`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Say hi to start your daily check-in.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 max-w-[90%] ${
              m.role === "user"
                ? "self-end bg-indigo-500 text-white"
                : "self-start bg-slate-700 text-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start text-sm text-slate-400">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm bg-slate-800 border border-slate-600 text-slate-100 placeholder:text-slate-500 rounded-md px-3 py-2 outline-none focus:border-indigo-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="text-sm bg-indigo-500 text-white rounded-md px-3 py-2 hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
