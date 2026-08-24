import { NextResponse } from "next/server";
import { getSheetsClient, sheetsErrorResponse } from "@/app/lib/googleSheets";
import { DEFAULT_JOB_STATUS, isJobStatus } from "@/app/lib/jobStatus";

const LINK_FORMULA_RE = /^=HYPERLINK\("([^"]*)"/;

export async function GET() {
  try {
    const { sheets, spreadsheetId } = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Jobs!A:I" });
    const rows = res.data.values ?? [];
    const dataRowCount = Math.max(0, rows.length - 1); // rows.length includes the header row

    let linkFormulas: string[] = [];
    if (dataRowCount > 0) {
      const linkRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Jobs!F2:F${dataRowCount + 1}`,
        valueRenderOption: "FORMULA",
      });
      linkFormulas = (linkRes.data.values ?? []).map((r) => r[0] ?? "");
    }

    const jobs = rows.slice(1).map((row, i) => {
      const match = LINK_FORMULA_RE.exec(linkFormulas[i] ?? "");
      const rawStatus = row[8];
      return {
        row: i + 2, // 1-based sheet row; row 1 is the header, row 2 is the first data row
        company: row[1] ?? "",
        role: row[2] ?? "",
        dateApplied: row[3] ?? "",
        location: row[4] ?? "",
        postingLink: match ? match[1] : "",
        applyType: row[6] ?? "",
        jobType: row[7] ?? "",
        status: isJobStatus(rawStatus) ? rawStatus : DEFAULT_JOB_STATUS,
      };
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    return sheetsErrorResponse("list jobs from Sheets", err);
  }
}
