import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

function extractLinkedInJobInfo(html: string, postingLink: string) {
  const $ = cheerio.load(html);

  const companyName = $('a[href*="linkedin.com/company"]').first().text();
  const jobPosting = $("h3").first().text();
  // ".topcard__flavor--bullet" is LinkedIn's semantic class for the location bullet on
  // public job posting pages; fall back to the old positional guess if it's not present.
  const location = $(".topcard__flavor--bullet").first().text().trim() || $("span").eq(5).text();

  return { companyName, jobPosting, location, postingLink };
}

// Best-effort selectors based on Indeed's commonly-documented `data-testid` markup —
// not verified against a live page. Indeed also runs heavier anti-scraping/bot-detection
// than LinkedIn's static public pages, so this may need real-world adjustment or simply
// not work at all depending on what HTML actually comes back.
function extractIndeedJobInfo(html: string, postingLink: string) {
  const $ = cheerio.load(html);

  const companyName =
    $('[data-testid="inline-company-name"]').first().text().trim() ||
    $(".jobsearch-InlineCompanyRating > div").first().text().trim();
  const jobPosting =
    $('[data-testid="jobsearch-JobInfoHeader-title"]').first().text().trim() ||
    $("h1.jobsearch-JobInfoHeader-title").first().text().trim();
  const location =
    $('[data-testid="inline-company-location"]').first().text().trim() ||
    $(".jobsearch-JobInfoHeader-subtitle > div").eq(1).text().trim();

  return { companyName, jobPosting, location, postingLink };
}

export async function POST(req: Request) {
  const { value } = await req.json().catch(() => ({}));

  if (typeof value !== "string" || !value) {
    return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 });
  }

  let cleanUrl: string;
  let source: "LinkedIn" | "Indeed";
  try {
    const url = new URL(value);
    if (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com")) {
      source = "LinkedIn";
    } else if (url.hostname === "indeed.com" || url.hostname.endsWith(".indeed.com")) {
      source = "Indeed";
    } else {
      return NextResponse.json({ error: "Only linkedin.com or indeed.com URLs are allowed" }, { status: 400 });
    }
    cleanUrl = `${url.origin}${url.pathname}`;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

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

  const extracted =
    source === "Indeed" ? extractIndeedJobInfo(data, cleanUrl) : extractLinkedInJobInfo(data, cleanUrl);

  const foundNothing =
    !extracted.companyName.trim() && !extracted.jobPosting.trim() && !extracted.location.trim();
  if (foundNothing) {
    // A page that loaded but yielded nothing usually means the selectors didn't match what
    // came back — a bot-block/CAPTCHA page or a login wall instead of the real posting are
    // common causes. The fetched page's <title> is a cheap, often very telling diagnostic
    // (e.g. "Just a moment..." or "Sign in") for figuring out which.
    const pageTitle = cheerio.load(data)("title").first().text().trim();
    return NextResponse.json(
      {
        error:
          `Scrape found no usable data on the ${source} page — it may have blocked the request or served unexpected content` +
          (pageTitle ? ` (page title: "${pageTitle}")` : "") +
          ".",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ ...extracted, source });
}
