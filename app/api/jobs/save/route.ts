import { google } from "googleapis";
import { NextResponse } from "next/server";

interface JobData {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
}

function isJobData(value: unknown): value is JobData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.companyName === "string" &&
    typeof v.jobPosting === "string" &&
    typeof v.location === "string" &&
    typeof v.postingLink === "string"
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const dataOne = (body as { dataOne?: unknown }).dataOne;

  if (!isJobData(dataOne)) {
    return NextResponse.json({ error: "Missing or invalid dataOne" }, { status: 400 });
  }

  const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!rawCreds || !spreadsheetId) {
    return NextResponse.json({ error: "Google Sheets credentials missing" }, { status: 500 });
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
  ];

  try {
    const creds = JSON.parse(rawCreds);
    creds.private_key = creds.private_key.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // Let Sheets locate the insert row itself (instead of read-then-write-to-computed-row)
    // so concurrent saves can't collide on the same row.
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      range: "Jobs!A:F",
      requestBody: { values: [spreadSheetArray] },
    });

    return NextResponse.json(res.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to save to Sheets: ${message}` }, { status: 502 });
  }
}

// Get date helper function
function getCurrentDateMMDDYY() {
  const today = new Date();

  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
}
