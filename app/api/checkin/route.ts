import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TodoSummary {
  title: string;
  completed: boolean;
  priority: string;
  dueDate: string | null;
}

function buildSystemPrompt(todos: TodoSummary[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const todoLines = todos.length
    ? todos
        .map(
          (t) =>
            `- [${t.completed ? "x" : " "}] ${t.title}${t.priority !== "none" ? ` (priority: ${t.priority})` : ""}${t.dueDate ? ` (due: ${t.dueDate})` : ""}`
        )
        .join("\n")
    : "No todos found.";

  return `You are a daily check-in coach inside the user's personal todo app. Today's date is ${today}.
Here is the user's current todo list:
${todoLines}

Have a brief, supportive daily check-in conversation. Ask about progress on their todos, surface blockers, and help them prioritize what to focus on today. Keep responses concise and conversational.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  const { messages, todos } = (await req.json()) as {
    messages: ChatMessage[];
    todos: TodoSummary[];
  };

  const contents = messages.length
    ? messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))
    : [{ role: "user", parts: [{ text: "Let's start today's check-in." }] }];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt(todos) }] },
        contents,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Gemini request failed: ${text}` }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return NextResponse.json({ reply });
}
