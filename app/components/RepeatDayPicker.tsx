"use client";

import { DAYS } from "@/app/lib/repeatDays";

interface RepeatDayPickerProps {
  selectedDays: number[];
  onToggle: (day: number) => void;
  variant?: "dark" | "light";
}

const variantStyles = {
  dark: {
    active: "bg-indigo-500 text-white",
    inactive: "bg-slate-700 text-slate-400 hover:text-white",
  },
  light: {
    active: "bg-indigo-500 text-white",
    inactive: "border border-zinc-200 text-zinc-500 hover:border-zinc-400",
  },
};

export default function RepeatDayPicker({ selectedDays, onToggle, variant = "light" }: RepeatDayPickerProps) {
  const styles = variantStyles[variant];

  return (
    <div className="flex gap-1">
      {DAYS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onToggle(i)}
          className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
            selectedDays.includes(i) ? styles.active : styles.inactive
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
