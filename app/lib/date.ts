export function dateParts(date: Date): { year: string; month: string; day: string } {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return { year, month, day };
}

export function toDateString(date: Date): string {
  const { year, month, day } = dateParts(date);
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return toDateString(new Date());
}
