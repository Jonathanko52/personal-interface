import { NextResponse } from "next/server";
import { getSheetsClient } from "@/app/lib/googleSheets";
import { getCurrentDateMMDDYY } from "@/app/lib/sheetDate";

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Jobs!A:G",
    });

    const rows = res.data.values ?? [];
    const today = getCurrentDateMMDDYY();

    let total = 0;
    let quickApply = 0;
    let normalApply = 0;

    for (const row of rows) {
      const [, , , rowDate, , , rowApplyType] = row;
      if (rowDate !== today) continue;
      total++;
      if (rowApplyType === "Quick Apply") quickApply++;
      else if (rowApplyType === "Normal Apply") normalApply++;
    }

    return NextResponse.json({ total, quickApply, normalApply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to count Sheets rows: ${message}` }, { status: 502 });
  }
}
