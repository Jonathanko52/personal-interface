import { NextResponse } from "next/server";
import { getSheetsClient } from "@/app/lib/googleSheets";
import { getCurrentDateMMDDYY } from "@/app/lib/sheetDate";

interface JobData {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
  applyType: "quick" | "normal";
}

function isJobData(value: unknown): value is JobData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.companyName === "string" &&
    typeof v.jobPosting === "string" &&
    typeof v.location === "string" &&
    typeof v.postingLink === "string" &&
    (v.applyType === "quick" || v.applyType === "normal")
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
    dataOne.companyName,
    dataOne.jobPosting,
    getCurrentDateMMDDYY(),
    dataOne.location,
    postingLinkAsHyperlink,
    dataOne.applyType === "quick" ? "Quick Apply" : "Normal Apply",
  ];

  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    // Let Sheets locate the insert row itself (instead of read-then-write-to-computed-row)
    // so concurrent saves can't collide on the same row.
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: "Jobs!A:G",
      requestBody: { values: [spreadSheetArray] },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to save to Sheets: ${message}` }, { status: 502 });
  }
}
