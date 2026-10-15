import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { DEFAULT_JOB_STATUS, isJobStatus } from "@/app/lib/jobStatus";
import { parseMatchScore } from "@/app/lib/jobFields";
import { JOB_SHEET, JOB_COLUMNS, JOB_LAST_COLUMN, colIndex } from "@/app/lib/jobColumns";

const LINK_FORMULA_RE = /^=HYPERLINK\("([^"]*)"/;

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${JOB_SHEET}!A:${JOB_LAST_COLUMN}`,
    });
    const rows = res.data.values ?? [];
    const dataRowCount = Math.max(0, rows.length - 1); // rows.length includes the header row

    let linkFormulas: string[] = [];
    if (dataRowCount > 0) {
      const linkRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${JOB_SHEET}!${JOB_COLUMNS.postingLink}2:${JOB_COLUMNS.postingLink}${dataRowCount + 1}`,
        valueRenderOption: "FORMULA",
      });
      linkFormulas = (linkRes.data.values ?? []).map((r) => r[0] ?? "");
    }

    const jobs = rows.slice(1).map((row, i) => {
      const match = LINK_FORMULA_RE.exec(linkFormulas[i] ?? "");
      const rawStatus = row[colIndex("status")];
      const rawCategories: string = row[colIndex("categories")] ?? "";
      return {
        row: i + 2, // 1-based sheet row; row 1 is the header, row 2 is the first data row
        company: row[colIndex("company")] ?? "",
        role: row[colIndex("role")] ?? "",
        dateApplied: row[colIndex("dateApplied")] ?? "",
        location: row[colIndex("location")] ?? "",
        postingLink: match ? match[1] : "",
        applyType: row[colIndex("applyType")] ?? "",
        jobType: row[colIndex("jobType")] ?? "",
        status: isJobStatus(rawStatus) ? rawStatus : DEFAULT_JOB_STATUS,
        categories: rawCategories
          ? rawCategories.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        source: row[colIndex("source")] ?? "",
        // Sheets returns cell text, so parse here and send the client a number (null if blank).
        matchScore: parseMatchScore(String(row[colIndex("matchScore")] ?? "")),
      };
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    return sheetsErrorResponse("list jobs from Sheets", err);
  }
}
