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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  const { messages, todos } = (await req.json()) as {
    messages: ChatMessage[];
    todos: TodoSummary[];
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(todos) },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `OpenAI request failed: ${text}` }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";

  return NextResponse.json({ reply });
}
