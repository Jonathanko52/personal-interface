"use client";

interface PillPickerProps<T extends string | number> {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
  format?: (value: T) => string;
  capitalize?: boolean;
}

export default function PillPicker<T extends string | number>({
  options,
  selected,
  onSelect,
  format,
  capitalize,
}: PillPickerProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${capitalize ? "capitalize" : ""} ${
            selected === option
              ? "bg-indigo-500 text-white border-indigo-500"
              : "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white"
          }`}
        >
          {format ? format(option) : option}
        </button>
      ))}
    </div>
  );
}
