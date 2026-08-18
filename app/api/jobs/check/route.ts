import { NextResponse } from "next/server";
import { getSheetsClient } from "@/app/lib/googleSheets";
import { parseSheetDate } from "@/app/lib/sheetDate";

const DAYS_WINDOW = 7;
const RECENT_ROW_LIMIT = 200;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company")?.trim();

  if (!company) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    // Column A alone (cheap, single column) tells us how many rows actually have
    // data, so the B:D fetch below can be bounded to a recent window instead of
    // scanning the whole sheet's history on every check.
    const colA = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Jobs!A:A" });
    const totalRows = colA.data.values?.length ?? 0;

    if (totalRows < 2) {
      return NextResponse.json({ duplicate: false });
    }

    const startRow = Math.max(2, totalRows - RECENT_ROW_LIMIT + 1);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Jobs!B${startRow}:D${totalRows}`,
    });

    const rows = res.data.values ?? [];
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
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
