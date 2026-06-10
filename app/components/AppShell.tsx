"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

export type ActivePanel = "navigation" | "jobs" | "checkin" | null;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  function handleSelect(panel: ActivePanel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  return (
    <>
      <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center px-6">
        <span className="font-semibold tracking-tight">Todos</span>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePanel={activePanel} onSelect={handleSelect} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <RightPanel activePanel={activePanel} onClose={() => setActivePanel(null)} />
      </div>
    </>
  );
}
