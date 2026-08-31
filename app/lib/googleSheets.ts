import { google } from "googleapis";
import { NextResponse } from "next/server";

type SheetsClient = { sheets: ReturnType<typeof google.sheets>; spreadsheetId: string };

let cachedClient: SheetsClient | null = null;

export function getSheetsClient(): SheetsClient {
  if (cachedClient) return cachedClient;

  const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!rawCreds || !spreadsheetId) {
    throw new Error("Google Sheets credentials missing");
  }

  const creds = JSON.parse(rawCreds);
  creds.private_key = creds.private_key.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
  return cachedClient;
}

export function sheetsErrorResponse(action: string, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: `Failed to ${action}: ${message}` }, { status: 502 });
}

// Cells starting with these characters are interpreted as formulas by Sheets even
// under USER_ENTERED input; a leading apostrophe forces literal-text interpretation.
const SHEETS_FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function sanitizeForSheets(value: string): string {
  return SHEETS_FORMULA_PREFIX.test(value) ? `'${value}` : value;
}
