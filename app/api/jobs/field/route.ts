import { NextResponse } from "next/server";
import { parseRow, updateSheetCell, sheetsErrorResponse, sanitizeForSheets } from "@/app/lib/googleSheets";
import { isApplyType, isJobTypeLabel } from "@/app/lib/jobFields";

type EditableField = "applyType" | "jobType" | "company" | "role" | "location";

const FIELD_COLUMNS: Record<EditableField, string> = {
  applyType: "G",
  jobType: "H",
  company: "B",
  role: "C",
  location: "E",
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const FIELD_VALIDATORS: Record<EditableField, (value: unknown) => boolean> = {
  applyType: isApplyType,
  jobType: isJobTypeLabel,
  company: isNonEmptyString,
  role: isNonEmptyString,
  location: isNonEmptyString,
};

const FREE_TEXT_FIELDS = new Set<EditableField>(["company", "role", "location"]);

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const row = parseRow(body);
  const field = (body as { field?: unknown }).field;
  const value = (body as { value?: unknown }).value;

  if (row === null) {
    return NextResponse.json({ error: "Missing or invalid row" }, { status: 400 });
  }
  if (typeof field !== "string" || !(field in FIELD_COLUMNS)) {
    return NextResponse.json({ error: "Missing or invalid field" }, { status: 400 });
  }
  const typedField = field as EditableField;
  if (!FIELD_VALIDATORS[typedField](value)) {
    return NextResponse.json({ error: "Missing or invalid value" }, { status: 400 });
  }

  const column = FIELD_COLUMNS[typedField];
  const writeValue = FREE_TEXT_FIELDS.has(typedField) ? sanitizeForSheets((value as string).trim()) : value;

  try {
    await updateSheetCell(column, row, writeValue);
    return NextResponse.json({ row, field: typedField, value: writeValue });
  } catch (err) {
    return sheetsErrorResponse(`update ${field} in Sheets`, err);
  }
}
