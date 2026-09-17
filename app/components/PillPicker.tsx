"use client";

interface PillPickerProps<T extends string | number> {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
  format?: (value: T) => string;
  capitalize?: boolean;
  theme?: "dark" | "light";
  gap?: "sm" | "md";
}

const THEME_UNSELECTED: Record<"dark" | "light", string> = {
  dark: "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white",
  light: "border-zinc-300 text-zinc-600 hover:border-zinc-400",
};

const GAP_CLASS: Record<"sm" | "md", string> = {
  sm: "gap-1.5",
  md: "gap-2",
};

export default function PillPicker<T extends string | number>({
  options,
  selected,
  onSelect,
  format,
  capitalize,
  theme = "dark",
  gap = "md",
}: PillPickerProps<T>) {
  return (
    <div className={`flex ${GAP_CLASS[gap]}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${capitalize ? "capitalize" : ""} ${
            selected === option
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
