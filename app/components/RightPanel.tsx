"use client";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function RightPanel({ isOpen, onClose, children }: RightPanelProps) {
  return (
    <div
      className={`shrink-0 border-l border-zinc-200 bg-white overflow-y-auto transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-80 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-700">Details</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children ?? (
          <p className="text-sm text-zinc-400">Nothing selected.</p>
        )}
      </div>
    </div>
  );
}
