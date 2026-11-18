"use client";

import type { ReactNode } from "react";

// A row of small buttons with one selected (Part 115): the Today page's range toggle, the
// sort/filter bars, and the Applications filters. Holds the shared styling in one place.
export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
            value === o.value ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
