export function getCurrentDateMMDDYY(): string {
  const today = new Date();

  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
}

export function parseSheetDate(mmddyy: string): Date | null {
  const match = mmddyy.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const [, mm, dd, yy] = match;
  return new Date(2000 + Number(yy), Number(mm) - 1, Number(dd));
}
