"use client";

import { ActivePanel } from "./AppShell";
import NavigationPanel from "./NavigationPanel";

interface RightPanelProps {
  activePanel: ActivePanel;
  onClose: () => void;
}

export default function RightPanel({ activePanel, onClose }: RightPanelProps) {
  const isOpen = activePanel !== null;

  return (
    <div
      className={`shrink-0 border-l border-zinc-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-72 flex flex-col h-full">
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200">
          <span className="text-sm font-medium text-zinc-700 capitalize">{activePanel}</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === "navigation" && <NavigationPanel />}
          {activePanel === "jobs" && (
            <p className="text-sm text-zinc-400">Job scraper coming soon.</p>
          )}
          {activePanel === "checkin" && (
            <p className="text-sm text-zinc-400">Daily check-in coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
