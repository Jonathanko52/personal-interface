"use client";

import { useState } from "react";

type PanelTab = "jobs" | "checkin";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("jobs");

  return (
    <div
      className={`shrink-0 border-l border-zinc-200 bg-white flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-80 flex flex-col h-full">
        <div className="flex items-center border-b border-zinc-200 px-3 pt-3 gap-1">
          {(["jobs", "checkin"] as PanelTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium px-3 py-2 rounded-t-md transition-colors capitalize ${
                activeTab === tab
                  ? "bg-zinc-100 text-zinc-900 border border-b-0 border-zinc-200"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              {tab === "checkin" ? "Check-in" : "Jobs"}
            </button>
          ))}
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-700 transition-colors pb-2 px-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "jobs" && (
            <p className="text-sm text-zinc-400">Job scraper coming soon.</p>
          )}
          {activeTab === "checkin" && (
            <p className="text-sm text-zinc-400">Daily check-in coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
