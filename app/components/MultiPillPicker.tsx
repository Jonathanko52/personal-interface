"use client";

import { THEME_UNSELECTED, GAP_CLASS } from "./PillPicker";

interface MultiPillPickerProps<T extends string | number> {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  format?: (value: T) => string;
  capitalize?: boolean;
  theme?: "dark" | "light";
  gap?: "sm" | "md";
}

export default function MultiPillPicker<T extends string | number>({
  options,
  selected,
  onToggle,
  format,
  capitalize,
  theme = "dark",
  gap = "md",
}: MultiPillPickerProps<T>) {
  return (
    <div className={`flex flex-wrap ${GAP_CLASS[gap]}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onToggle(option)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${capitalize ? "capitalize" : ""} ${
            selected.includes(option)
              ? "bg-indigo-500 text-white border-indigo-500"
              : THEME_UNSELECTED[theme]
          }`}
        >
          {format ? format(option) : option}
        </button>
      ))}
    </div>
  );
}
