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

const itemClass =
  "w-full text-left text-sm rounded-md px-3 py-2 transition-colors text-slate-200 hover:text-white hover:bg-slate-700";

export default function NavigationPanel({ onSelect }: NavigationPanelProps) {
  const router = useRouter();

  return (
    <nav className="w-44 shrink-0 border-r border-slate-400 bg-slate-900 flex flex-col py-4 px-3 gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Pages</h2>
        <button
          onClick={() => {
            router.push("/");
            onSelect("todo");
          }}
          className={itemClass}>
          Todo
        </button>
        <Link href="/metrics" className={itemClass}>
          Metrics
        </Link>
        <Link href="/applications" className={itemClass}>
          Applications
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Panels</h2>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={itemClass}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
