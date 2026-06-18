import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { value } = await req.json();

  // Clean URL
  const url = new URL(value);
  const cleanUrl = `${url.origin}${url.pathname}`;

  //Scrape the page
  const { data } = await axios.get(cleanUrl);
  const $ = cheerio.load(data);

  // Grabbing values
  const link = $('a[href*="linkedin.com/company"]').first();
  const companyName = link.text();
  const postingLink = cleanUrl;
  const jobPosting = $("h3").first().text();
  const location = $("span").eq(5).text();

  // Return object
  return NextResponse.json({
    companyName: companyName,
    jobPosting: jobPosting,
    location: location,
    postingLink: postingLink,
  });
}
