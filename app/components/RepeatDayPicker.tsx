"use client";

import { DAYS } from "@/app/lib/repeatDays";

interface RepeatDayPickerProps {
  selectedDays: number[];
  onToggle: (day: number) => void;
}

export default function RepeatDayPicker({ selectedDays, onToggle }: RepeatDayPickerProps) {
  return (
    <div className="flex gap-1">
      {DAYS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onToggle(i)}
          className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
            selectedDays.includes(i) ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
