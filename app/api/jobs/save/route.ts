import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse, sanitizeForSheets } from "@/app/lib/googleSheets";
import { getCurrentDateMMDDYY } from "@/app/lib/sheetDate";
import { DEFAULT_JOB_STATUS } from "@/app/lib/jobStatus";
import { ApplyTypeCode, JobTypeCode, APPLY_TYPE_LABELS, JOB_TYPE_LABELS } from "@/app/lib/jobFields";

interface JobData {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
  applyType: ApplyTypeCode;
  jobType: JobTypeCode;
}

function isJobData(value: unknown): value is JobData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.companyName === "string" &&
    typeof v.jobPosting === "string" &&
    typeof v.location === "string" &&
    typeof v.postingLink === "string" &&
    (v.applyType === "quick" || v.applyType === "normal") &&
    (v.jobType === "internship" || v.jobType === "part-time" || v.jobType === "full-time")
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const dataOne = (body as { dataOne?: unknown }).dataOne;

  if (!isJobData(dataOne)) {
    return NextResponse.json({ error: "Missing or invalid dataOne" }, { status: 400 });
  }

  const safePostingLink = dataOne.postingLink.replace(/"/g, "");
  const postingLinkAsHyperlink = `=HYPERLINK("${safePostingLink}", "Link")`;

  const spreadSheetArray = [
    "LinkedIn",
    sanitizeForSheets(dataOne.companyName),
    sanitizeForSheets(dataOne.jobPosting),
    getCurrentDateMMDDYY(),
    sanitizeForSheets(dataOne.location),
    postingLinkAsHyperlink,
    APPLY_TYPE_LABELS[dataOne.applyType],
    JOB_TYPE_LABELS[dataOne.jobType],
    DEFAULT_JOB_STATUS,
  ];

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    // Let Sheets locate the insert row itself (instead of read-then-write-to-computed-row)
    // so concurrent saves can't collide on the same row.
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: "Jobs!A:I",
      requestBody: { values: [spreadSheetArray] },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return sheetsErrorResponse("save to Sheets", err);
  }
}
