"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lists, tags } from "@/app/lib/data";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex items-center gap-2 text-sm rounded-md px-3 py-2 transition-colors ${
      pathname === href
        ? "bg-indigo-50 text-indigo-700 font-medium"
        : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
    }`;

  return (
    <nav className="w-60 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto flex flex-col gap-6 p-4">
      <Link href="/" className={linkClass("/")}>
        Today
      </Link>

      <section>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Lists
        </p>
        <ul className="flex flex-col gap-1">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/list/${list.id}`} className={linkClass(`/list/${list.id}`)}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: list.color }} />
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
              <Link href={`/tags/${tag.id}`} className={linkClass(`/tags/${tag.id}`)}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </nav>
  );
}
