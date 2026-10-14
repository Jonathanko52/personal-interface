import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse, sanitizeForSheets } from "@/app/lib/googleSheets";
import { getCurrentDateMMDDYY } from "@/app/lib/sheetDate";
import { DEFAULT_JOB_STATUS } from "@/app/lib/jobStatus";
import { JOB_SHEET, JOB_LAST_COLUMN, JobColumnField, colIndex } from "@/app/lib/jobColumns";
import {
  ApplyTypeCode,
  JobTypeCode,
  JobSource,
  APPLY_TYPE_LABELS,
  JOB_TYPE_LABELS,
  DEFAULT_JOB_SOURCE,
  isJobCategory,
  isJobSource,
  isMatchScore,
} from "@/app/lib/jobFields";

interface JobData {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
  applyType: ApplyTypeCode;
  jobType: JobTypeCode;
  // Optional: not every caller (e.g. app/jobs/new/page.tsx, pending its own Source dropdown)
  // sends this yet — falls back to DEFAULT_JOB_SOURCE below when absent.
  source?: JobSource;
  categories: string[];
  matchScore?: number | null;
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
    (v.jobType === "internship" || v.jobType === "part-time" || v.jobType === "full-time") &&
    (v.source === undefined || isJobSource(v.source)) &&
    Array.isArray(v.categories) && v.categories.every(isJobCategory) &&
    (v.matchScore === undefined || v.matchScore === null || isMatchScore(v.matchScore))
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const dataOne = (body as { dataOne?: unknown }).dataOne;

  if (!isJobData(dataOne)) {
    return NextResponse.json({ error: "Missing or invalid dataOne" }, { status: 400 });
  }

  // Posting Link is optional for manually-entered jobs (no scrape to source it from) — skip
  // wrapping a blank value in a broken HYPERLINK formula and just write an empty cell instead.
  const trimmedPostingLink = dataOne.postingLink.trim();
  const safePostingLink = trimmedPostingLink.replace(/"/g, "");
  const postingLinkCell = trimmedPostingLink ? `=HYPERLINK("${safePostingLink}", "Link")` : "";

  // Keyed by field (the Record type makes leaving one out a compile error), then placed at each
  // field's column index, so the written order always follows JOB_COLUMNS.
  const cells: Record<JobColumnField, string | number> = {
    source: dataOne.source ?? DEFAULT_JOB_SOURCE,
    company: sanitizeForSheets(dataOne.companyName),
    role: sanitizeForSheets(dataOne.jobPosting),
    dateApplied: getCurrentDateMMDDYY(),
    location: sanitizeForSheets(dataOne.location),
    postingLink: postingLinkCell,
    applyType: APPLY_TYPE_LABELS[dataOne.applyType],
    jobType: JOB_TYPE_LABELS[dataOne.jobType],
    status: DEFAULT_JOB_STATUS,
    categories: dataOne.categories.join(", "),
    matchScore: dataOne.matchScore ?? "",
  };
  const spreadSheetArray: (string | number)[] = [];
  for (const field of Object.keys(cells) as JobColumnField[]) {
    spreadSheetArray[colIndex(field)] = cells[field];
  }

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    // Let Sheets locate the insert row itself (instead of read-then-write-to-computed-row)
    // so concurrent saves can't collide on the same row.
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: `${JOB_SHEET}!A:${JOB_LAST_COLUMN}`,
      requestBody: { values: [spreadSheetArray] },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return sheetsErrorResponse("save to Sheets", err);
  }
}
