"use client";

import { StackSortOption } from "@/app/lib/useStackSort";

interface StackSortBarProps {
  sort: StackSortOption;
  onSortChange: (s: StackSortOption) => void;
}

const sortOptions: { value: StackSortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "score", label: "Score" },
  { value: "company", label: "Company" },
  { value: "role", label: "Role" },
];

export default function StackSortBar({ sort, onSortChange }: StackSortBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-400 font-medium">Sort</span>
      <div className="flex gap-1">
        {sortOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => onSortChange(o.value)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              sort === o.value
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
