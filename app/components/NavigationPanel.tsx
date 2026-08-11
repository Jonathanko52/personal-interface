"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActivePanel } from "./AppShell";

const NAV_ITEMS: { id: ActivePanel; label: string }[] = [
  { id: "jobs", label: "Jobs" },
];

interface NavigationPanelProps {
  onSelect: (panel: ActivePanel) => void;
}

const itemClass = "w-full text-left text-sm rounded-md px-3 py-2 transition-colors text-slate-400 hover:text-white hover:bg-slate-700";

export default function NavigationPanel({ onSelect }: NavigationPanelProps) {
  const router = useRouter();

  return (
    <nav className="w-44 shrink-0 border-r border-slate-700 bg-slate-900 flex flex-col py-4 px-3 gap-1">
      <button
        onClick={() => {
          router.push("/");
          onSelect("todo");
        }}
        className={itemClass}
      >
        Todo
      </button>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={itemClass}
        >
          {item.label}
        </button>
      ))}
      <Link href="/metrics" className={itemClass}>
        Metrics
      </Link>
    </nav>
  );
}
