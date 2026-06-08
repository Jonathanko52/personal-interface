"use client";

interface Todo {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
  completed: boolean;
}

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
}

const priorityOptions = ["none", "low", "medium", "high"];

export default function TodoDetail({ todo, onClose }: TodoDetailProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col gap-5">
        <input
          type="text"
          defaultValue={todo.title}
          className="text-xl font-semibold text-zinc-900 outline-none border-b border-transparent focus:border-zinc-300 pb-1 transition-colors"
        />
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6">
          ← Back
        </button>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Notes
          </label>
          <textarea
            rows={4}
            placeholder="Add notes..."
            className="text-sm text-zinc-700 outline-none border border-zinc-200 rounded-md p-2 resize-none focus:border-zinc-400 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((p) => (
              <button
                key={p}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  todo.priority === p
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Due Date
          </label>
          <input
            type="date"
            defaultValue={todo.dueDate ?? ""}
            className="text-sm text-zinc-700 border border-zinc-200 rounded-md p-2 outline-none focus:border-zinc-400 transition-colors w-fit"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Tags
          </label>
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
              urgent
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
              later
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
