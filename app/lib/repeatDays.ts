export const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function toggleDay(days: number[], day: number): number[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
}

// Checking "One-off" clears repeatDays (the source of truth); unchecking leaves it
// untouched, since it's already empty at that point.
export function makeOneOffChangeHandler(
  setIsOneOff: (value: boolean) => void,
  setRepeatDays: (value: number[]) => void
) {
  return (checked: boolean) => {
    setIsOneOff(checked);
    if (checked) setRepeatDays([]);
  };
}
