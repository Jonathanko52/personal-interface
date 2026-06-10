"use client";

import { ActivePanel } from "./AppShell";

const NAV_ITEMS: { id: ActivePanel; label: string }[] = [
  { id: "navigation", label: "Navigation" },
  { id: "jobs", label: "Jobs" },
  { id: "checkin", label: "Check-in" },
];

interface SidebarProps {
  activePanel: ActivePanel;
  onSelect: (panel: ActivePanel) => void;
}

export default function Sidebar({ activePanel, onSelect }: SidebarProps) {
  return (
    <nav className="w-44 shrink-0 border-r border-zinc-200 bg-white flex flex-col py-4 px-3 gap-1">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full text-left text-sm rounded-md px-3 py-2 transition-colors ${
            activePanel === item.id
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
