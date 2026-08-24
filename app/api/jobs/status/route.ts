import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { isJobStatus } from "@/app/lib/jobStatus";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const row = Number((body as { row?: unknown }).row);
  const status = (body as { status?: unknown }).status;

  if (!Number.isInteger(row) || row < 2) {
    return NextResponse.json({ error: "Missing or invalid row" }, { status: 400 });
  }
  if (!isJobStatus(status)) {
    return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
  }

  try {
    const { sheets, spreadsheetId } = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Jobs!I${row}:I${row}`,
      valueInputOption: "RAW",
      requestBody: { values: [[status]] },
    });
    return NextResponse.json({ row, status });
  } catch (err) {
    return sheetsErrorResponse("update status in Sheets", err);
  }
}
