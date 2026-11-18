"use client";

import { SortOption, FilterOption } from "@/app/lib/useSortFilter";
import SegmentedControl from "./SegmentedControl";

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
        <SegmentedControl options={sortOptions} value={sort} onChange={onSortChange} />
      </div>

      <div className="w-px h-4 bg-zinc-200" />

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 font-medium">Show</span>
        <SegmentedControl options={filterOptions} value={filter} onChange={onFilterChange} />
      </div>
    </div>
  );
}
