import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { parseSheetDate } from "@/app/lib/sheetDate";
import { JOB_SHEET, JOB_COLUMNS, colIndex } from "@/app/lib/jobColumns";

const DAYS_WINDOW = 7;
const RECENT_ROW_LIMIT = 200;
// Position of the applied date within the company…dateApplied read below.
const DATE_OFFSET = colIndex("dateApplied") - colIndex("company");

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
    const colA = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${JOB_SHEET}!${JOB_COLUMNS.source}:${JOB_COLUMNS.source}`,
    });
    const totalRows = colA.data.values?.length ?? 0;

    if (totalRows < 2) {
      return NextResponse.json({ duplicate: false });
    }

    const startRow = Math.max(2, totalRows - RECENT_ROW_LIMIT + 1);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${JOB_SHEET}!${JOB_COLUMNS.company}${startRow}:${JOB_COLUMNS.dateApplied}${totalRows}`,
    });

    const rows = res.data.values ?? [];
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - DAYS_WINDOW);

    const duplicate = rows.some((row) => {
      const rowCompany = row[0]; // the read starts at the company column
      const rowDate = row[DATE_OFFSET];
      if (!rowCompany || rowCompany.trim().toLowerCase() !== company.toLowerCase()) return false;
      const parsed = rowDate ? parseSheetDate(rowDate) : null;
      return parsed ? parsed >= cutoff : false;
    });

    return NextResponse.json({ duplicate });
  } catch (err) {
    return sheetsErrorResponse("check Sheets", err);
  }
}
