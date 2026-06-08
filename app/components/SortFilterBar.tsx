"use client";

import { SortOption, FilterOption } from "@/app/lib/useSortFilter";

interface SortFilterBarProps {
  sort: SortOption;
  filter: FilterOption;
  onSortChange: (s: SortOption) => void;
  onFilterChange: (f: FilterOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "due-date", label: "Due date" },
  { value: "priority", label: "Priority" },
];

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function SortFilterBar({ sort, filter, onSortChange, onFilterChange }: SortFilterBarProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 font-medium">Sort</span>
        <div className="flex gap-1">
          {sortOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => onSortChange(o.value)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                sort === o.value
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-4 bg-zinc-200" />

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 font-medium">Show</span>
        <div className="flex gap-1">
          {filterOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => onFilterChange(o.value)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                filter === o.value
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
