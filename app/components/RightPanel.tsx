"use client";

import { ActivePanel } from "./AppShell";
import NavigationPanel from "./NavigationPanel";
import JobsPanel from "./JobsPanel";

interface RightPanelProps {
  activePanel: ActivePanel;
  minimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
}

const PANEL_LABELS: Record<NonNullable<ActivePanel>, string> = {
  navigation: "Navigation",
  jobs: "Jobs",
  checkin: "Check-in",
};

export default function RightPanel({ activePanel, minimized, onMinimize, onRestore }: RightPanelProps) {
  if (!activePanel) return null;

  if (minimized) {
    return (
      <div
        onClick={onRestore}
        className="shrink-0 w-8 border-l border-zinc-200 bg-white flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors"
        title={`Restore ${PANEL_LABELS[activePanel]}`}
      >
        <span className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
        >
          {PANEL_LABELS[activePanel]}
        </span>
      </div>
    );
  }

  return (
    <div className="shrink-0 w-72 border-l border-zinc-200 bg-white flex flex-col transition-all duration-300">
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200">
        <span className="text-sm font-medium text-zinc-700">{PANEL_LABELS[activePanel]}</span>
        <button
          onClick={onMinimize}
          className="text-zinc-400 hover:text-zinc-700 transition-colors text-xs"
          title="Minimize"
        >
          →
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === "navigation" && <NavigationPanel />}
        {activePanel === "jobs" && <JobsPanel />}
        {activePanel === "checkin" && (
          <p className="text-sm text-zinc-400">Daily check-in coming soon.</p>
        )}
      </div>
    </div>
  );
}
