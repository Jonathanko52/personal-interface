export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function today(): string {
  return toDateString(new Date());
}
