"use client";

import { ReactNode } from "react";
import RepeatDayPicker from "./RepeatDayPicker";

interface RepeatDaysFieldProps {
  label: ReactNode;
  wrapperClassName?: string;
  repeatDays: number[];
  onToggleDay: (day: number) => void;
  isOneOff: boolean;
  onOneOffChange: (checked: boolean) => void;
}

export default function RepeatDaysField({
  label,
  wrapperClassName = "flex flex-col gap-1",
  repeatDays,
  onToggleDay,
  isOneOff,
  onOneOffChange,
}: RepeatDaysFieldProps) {
  return (
    <div className={wrapperClassName}>
      <div className="flex items-center gap-3">
        {label}
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isOneOff}
            onChange={(e) => onOneOffChange(e.target.checked)}
            className="accent-indigo-500"
          />
          One-off
        </label>
      </div>
      <RepeatDayPicker selectedDays={repeatDays} onToggle={onToggleDay} disabled={isOneOff} />
    </div>
  );
}
