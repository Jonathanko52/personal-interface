import Link from "next/link";

const lists = [
  { id: "1", name: "Work", color: "#6366f1" },
  { id: "2", name: "Personal", color: "#22c55e" },
  { id: "3", name: "Shopping", color: "#f59e0b" },
];

const tags = [
  { id: "1", name: "urgent", color: "#ef4444" },
  { id: "2", name: "later", color: "#94a3b8" },
];

export default function Sidebar() {
  return (
    <nav className="w-60 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto flex flex-col gap-6 p-4">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-md px-3 py-2 transition-colors"
      >
        Today
      </Link>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Lists
        </p>
        <ul className="flex flex-col gap-1">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/list/${list.id}`}
                className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-md px-3 py-2 transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: list.color }}
                />
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Tags
        </p>
        <ul className="flex flex-col gap-1">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`/tags/${tag.id}`}
                className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-md px-3 py-2 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </nav>
  );
}
