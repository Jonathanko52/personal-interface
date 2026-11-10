"use client";

import { ActivePanel } from "./AppShell";
import ToDoOptions from "./ToDoOptions";
import JobsPanel from "./JobsPanel";

interface RightPanelProps {
  activePanel: ActivePanel;
  minimized: boolean;
  onMinimize: () => void;
  onRestore: () => void;
}

const PANEL_LABELS: Record<NonNullable<ActivePanel>, string> = {
  todo: "Todo",
  jobs: "Jobs",
};

export default function RightPanel({ activePanel, minimized, onMinimize, onRestore }: RightPanelProps) {
  if (!activePanel) return null;

  // Minimized: a small tab near the top of the right edge, only as tall as its label (Part 113),
  // instead of a full-height strip, so the main content keeps the width.
  if (minimized) {
    return (
      <button
        onClick={onRestore}
        className="group shrink-0 self-start mt-4 w-6 py-3 rounded-l-md border border-r-0 border-slate-700 bg-slate-900 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
        title={`Restore ${PANEL_LABELS[activePanel]}`}
      >
        <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
        >
          {PANEL_LABELS[activePanel]}
        </span>
      </button>
    );
  }

  return (
    <div className="shrink-0 w-72 border-l border-slate-700 bg-slate-900 flex flex-col transition-all duration-300">
      <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-200">{PANEL_LABELS[activePanel]}</span>
        <button
          onClick={onMinimize}
          className="text-slate-400 hover:text-white transition-colors text-xs"
          title="Minimize"
        >
          →
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === "todo" && <ToDoOptions />}
        {activePanel === "jobs" && <JobsPanel />}
      </div>
    </div>
  );
}
