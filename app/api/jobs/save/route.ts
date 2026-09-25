import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse, sanitizeForSheets } from "@/app/lib/googleSheets";
import { getCurrentDateMMDDYY } from "@/app/lib/sheetDate";
import { DEFAULT_JOB_STATUS } from "@/app/lib/jobStatus";
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

  const spreadSheetArray = [
    dataOne.source ?? DEFAULT_JOB_SOURCE,
    sanitizeForSheets(dataOne.companyName),
    sanitizeForSheets(dataOne.jobPosting),
    getCurrentDateMMDDYY(),
    sanitizeForSheets(dataOne.location),
    postingLinkCell,
    APPLY_TYPE_LABELS[dataOne.applyType],
    JOB_TYPE_LABELS[dataOne.jobType],
    DEFAULT_JOB_STATUS,
    dataOne.categories.join(", "),
    dataOne.matchScore ?? "",
  ];

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    // Let Sheets locate the insert row itself (instead of read-then-write-to-computed-row)
    // so concurrent saves can't collide on the same row.
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: "Jobs!A:K",
      requestBody: { values: [spreadSheetArray] },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    return sheetsErrorResponse("save to Sheets", err);
  }
}
