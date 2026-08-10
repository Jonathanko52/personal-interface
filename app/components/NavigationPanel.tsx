"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ActivePanel } from "./AppShell";

const NAV_ITEMS: { id: ActivePanel; label: string }[] = [
  { id: "jobs", label: "Jobs" },
];

interface NavigationPanelProps {
  activePanel: ActivePanel;
  onSelect: (panel: ActivePanel) => void;
}

export default function NavigationPanel({ activePanel, onSelect }: NavigationPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const itemClass = (active: boolean) =>
    `w-full text-left text-sm rounded-md px-3 py-2 transition-colors ${
      active
        ? "bg-slate-700 text-white font-medium"
        : "text-slate-400 hover:text-white hover:bg-slate-700"
    }`;

  return (
    <nav className="w-44 shrink-0 border-r border-slate-700 bg-slate-900 flex flex-col py-4 px-3 gap-1">
      <button
        onClick={() => {
          router.push("/");
          onSelect("todo");
        }}
        className={itemClass(activePanel === "todo")}
      >
        Todo
      </button>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={itemClass(activePanel === item.id)}
        >
          {item.label}
        </button>
      ))}
      <Link href="/metrics" className={itemClass(pathname === "/metrics")}>
        Metrics
      </Link>
    </nav>
  );
}
