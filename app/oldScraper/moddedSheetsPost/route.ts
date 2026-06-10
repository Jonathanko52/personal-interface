import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  // Credentials
  const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!rawCreds) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
  const creds = JSON.parse(rawCreds);
  creds.private_key = creds.private_key.replace(/\\n/g, "\n");

  // Authentication object
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // Sheets
  const sheets = google.sheets({ version: "v4", auth });

  // Calling spreadsheet and using range
  const body = await req.json().catch(() => ({}));

  // Making a call to find the first empty row
  const resReading = await sheets.spreadsheets.values.get({
    spreadsheetId: "1DcNybZwq7WrXw-AwWCGpPzQf6mDYKAbm1Co3U882gGQ",
    range: `${"Jobs"}!${"A"}:${"A"}`,
  });

  // resReading.data.values
  // returns a 2d array that represents the sheet. As columns are designated from A - A.
  //[  [ 'Job Posting Source', 'Company' ],  [ 'LinkedIn', 'IBM' ],]
  const firstOpenRow = resReading.data.values?.length
    ? resReading.data.values.length + 1
    : 0;

  const values = resReading.data.values?.flat() || [];

  const postingLinkAsHyperlink = `=HYPERLINK("${body.dataOne.postingLink}", "Link")`;

  const spreadSheetArray = [
    "LinkedIn",
    body.dataOne.companyName,
    body.dataOne.jobPosting,
    getCurrentDateMMDDYY(),
    body.dataOne.location,
    postingLinkAsHyperlink,
  ];

  // Call to append the job posting
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: "1DcNybZwq7WrXw-AwWCGpPzQf6mDYKAbm1Co3U882gGQ",
    valueInputOption: "USER_ENTERED",
    range: `Jobs!A${firstOpenRow}:F${firstOpenRow}`,
    requestBody: { values: [spreadSheetArray] },
  });

  // Return response
  return new Response(JSON.stringify(res.data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Get date helper function
function getCurrentDateMMDDYY() {
  const today = new Date();

  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = String(today.getFullYear()).slice(-2);

  return `${month}/${day}/${year}`;
}
