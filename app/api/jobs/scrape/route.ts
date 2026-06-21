import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

function extractJobInfo(html: string, postingLink: string) {
  const $ = cheerio.load(html);

  const companyName = $('a[href*="linkedin.com/company"]').first().text();
  const jobPosting = $("h3").first().text();
  const location = $("span").eq(5).text();

  return { companyName, jobPosting, location, postingLink };
}

export async function POST(req: Request) {
  const { value } = await req.json().catch(() => ({}));

  if (typeof value !== "string" || !value) {
    return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 });
  }

  // Clean URL
  let cleanUrl: string;
  try {
    const url = new URL(value);
    if (url.hostname !== "linkedin.com" && !url.hostname.endsWith(".linkedin.com")) {
      return NextResponse.json({ error: "Only linkedin.com URLs are allowed" }, { status: 400 });
    }
    cleanUrl = `${url.origin}${url.pathname}`;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Scrape the page
  let data: string;
  try {
    const res = await axios.get(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });
    data = res.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to fetch page: ${message}` }, { status: 502 });
  }

  return NextResponse.json(extractJobInfo(data, cleanUrl));
}
