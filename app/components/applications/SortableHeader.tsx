"use client";

export type SortDirection = "asc" | "desc";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}

// A clickable column header for the Applications table (moved out of the page in Part 120).
// The active column shows ▲/▼ for its sort direction.
export default function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: SortableHeaderProps) {
  return (
    <th
      onClick={onClick}
      className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2 cursor-pointer select-none hover:text-slate-200 transition-colors">
      {label}
      {active && (
        <span className="ml-1">{direction === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}
