export const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function toggleDay(days: number[], day: number): number[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
}
