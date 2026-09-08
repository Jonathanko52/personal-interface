import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { parseSheetDate } from "@/app/lib/sheetDate";
import { today as todayStr } from "@/app/lib/date";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since") ?? todayStr();
    const sinceDate = new Date(`${since}T00:00:00`);

    const { sheets, spreadsheetId } = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Jobs!A:G",
    });

    const rows = res.data.values ?? [];

    let total = 0;
    let quickApply = 0;
    let normalApply = 0;

    for (const row of rows) {
      const [, , , rowDate, , , rowApplyType] = row;
      const parsedDate = parseSheetDate(rowDate ?? "");
      if (!parsedDate || parsedDate < sinceDate) continue;
      total++;
      if (rowApplyType === "Quick Apply") quickApply++;
      else if (rowApplyType === "Normal Apply") normalApply++;
    }

    return NextResponse.json({ total, quickApply, normalApply });
  } catch (err) {
    return sheetsErrorResponse("count Sheets rows", err);
  }
}
