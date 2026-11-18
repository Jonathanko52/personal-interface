"use client";

import { StackSortOption } from "@/app/lib/useStackSort";
import SegmentedControl from "./SegmentedControl";

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
      <SegmentedControl options={sortOptions} value={sort} onChange={onSortChange} />
    </div>
  );
}
