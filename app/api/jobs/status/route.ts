import { NextResponse } from "next/server";
import { parseRow, updateSheetCell, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { isJobStatus } from "@/app/lib/jobStatus";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const row = parseRow(body);
  const status = (body as { status?: unknown }).status;

  if (row === null) {
    return NextResponse.json({ error: "Missing or invalid row" }, { status: 400 });
  }
  if (!isJobStatus(status)) {
    return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
  }

  try {
    await updateSheetCell("I", row, status);
    return NextResponse.json({ row, status });
  } catch (err) {
    return sheetsErrorResponse("update status in Sheets", err);
  }
}
