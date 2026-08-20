import { dateParts } from "./date";

export function getCurrentDateMMDDYY(): string {
  const { year, month, day } = dateParts(new Date());
  return `${month}/${day}/${year.slice(-2)}`;
}

export function parseSheetDate(mmddyy: string): Date | null {
  const match = mmddyy.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const [, mm, dd, yy] = match;
  return new Date(2000 + Number(yy), Number(mm) - 1, Number(dd));
}
