import { google } from "googleapis";

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
