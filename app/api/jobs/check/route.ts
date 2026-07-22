import { NextResponse } from "next/server";
import { getSheetsClient } from "@/app/lib/googleSheets";

const DAYS_WINDOW = 7;

function parseSheetDate(mmddyy: string): Date | null {
  const match = mmddyy.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const [, mm, dd, yy] = match;
  return new Date(2000 + Number(yy), Number(mm) - 1, Number(dd));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company")?.trim();

  if (!company) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Jobs!B:D",
    });

    const rows = res.data.values ?? [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_WINDOW);

    const duplicate = rows.some((row) => {
      const [rowCompany, , rowDate] = row;
      if (!rowCompany || rowCompany.trim().toLowerCase() !== company.toLowerCase()) return false;
      const parsed = rowDate ? parseSheetDate(rowDate) : null;
      return parsed ? parsed >= cutoff : false;
    });

    return NextResponse.json({ duplicate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to check Sheets: ${message}` }, { status: 502 });
  }
}
