import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { isApplyType, isJobTypeLabel } from "@/app/lib/jobFields";

type EditableField = "applyType" | "jobType";

const FIELD_COLUMNS: Record<EditableField, string> = {
  applyType: "G",
  jobType: "H",
};

const FIELD_VALIDATORS: Record<EditableField, (value: unknown) => boolean> = {
  applyType: isApplyType,
  jobType: isJobTypeLabel,
};

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const row = Number((body as { row?: unknown }).row);
  const field = (body as { field?: unknown }).field;
  const value = (body as { value?: unknown }).value;

  if (!Number.isInteger(row) || row < 2) {
    return NextResponse.json({ error: "Missing or invalid row" }, { status: 400 });
  }
  if (field !== "applyType" && field !== "jobType") {
    return NextResponse.json({ error: "Missing or invalid field" }, { status: 400 });
  }
  if (!FIELD_VALIDATORS[field](value)) {
    return NextResponse.json({ error: "Missing or invalid value" }, { status: 400 });
  }

  const column = FIELD_COLUMNS[field];

  try {
    const { sheets, spreadsheetId } = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Jobs!${column}${row}:${column}${row}`,
      valueInputOption: "RAW",
      requestBody: { values: [[value]] },
    });
    return NextResponse.json({ row, field, value });
  } catch (err) {
    return sheetsErrorResponse(`update ${field} in Sheets`, err);
  }
}
