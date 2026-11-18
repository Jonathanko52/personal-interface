import { JobCategory, JobTypeCode, suggestCategories, suggestJobType } from "./jobFields";

export interface ScrapedJob {
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
  // Suggestions derived from the posting's title and description.
  categories: JobCategory[];
  jobType: JobTypeCode;
}

// Scrapes a posting URL via /api/jobs/scrape (Part 116), shared by the Jobs panel and the
// Add a job page. Throws with the route's error message, or "Scrape failed (status)".
export async function scrapeJob(url: string): Promise<ScrapedJob> {
  const res = await fetch("/api/jobs/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: url.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Scrape failed (${res.status})`);
  return {
    companyName: data.companyName ?? "",
    jobPosting: data.jobPosting ?? "",
    location: data.location ?? "",
    postingLink: data.postingLink ?? "",
    categories: suggestCategories(`${data.jobPosting ?? ""} ${data.description ?? ""}`),
    jobType: suggestJobType(data.jobPosting ?? ""),
  };
}
