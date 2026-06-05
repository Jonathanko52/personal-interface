"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
        <span className="font-semibold tracking-tight">Todos</span>
        <button
          onClick={() => setPanelOpen((prev) => !prev)}
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {panelOpen ? "Close panel" : "Open panel"}
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <RightPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
      </div>
    </>
  );
}
