/*
  Indeed -> /jobs/new bookmarklet (Part 85).

  Runs in your own browser tab on an Indeed job posting, so Indeed's bot detection (which blocked
  server-side scraping, Part 45) doesn't apply. It reads company, role and location, then opens
  /jobs/new with them as query params, which that page uses to pre-fill its form.

  Install: create a new bookmark, and for its URL paste "javascript:" followed by this entire file.
  Browsers collapse a bookmark URL onto one line, so this file deliberately uses only block
  comments and explicit semicolons. Don't add line comments.

  Use: open an Indeed job (its own page, or selected in the search results pane), click the bookmark.

  The selectors below aren't verified against a live page. Indeed changes its markup now and then,
  so if a field comes through blank, inspect the posting and update the matching list.
*/
(function () {
  var APP_URL = "http://localhost:3000/jobs/new";

  function text(selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }
    return "";
  }

  /* Structured data first: it's meant for search engines, so it changes less often than the markup. */
  function fromJsonLd() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        if (data && data["@type"] === "JobPosting") {
          var address = (data.jobLocation && data.jobLocation.address) || {};
          return {
            role: data.title || "",
            company: (data.hiringOrganization && data.hiringOrganization.name) || "",
            location: [address.addressLocality, address.addressRegion].filter(Boolean).join(", "),
          };
        }
      } catch (e) {
        /* Not JSON we can use; try the next script. */
      }
    }
    return { role: "", company: "", location: "" };
  }

  var ld = fromJsonLd();

  var role =
    ld.role ||
    text([
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      ".jobsearch-JobInfoHeader-title",
      "h2.jobsearch-JobInfoHeader-title",
    ]);
  /* The visible title carries a screen-reader suffix like "- job post". */
  role = role.replace(/\s*-\s*job post\s*$/i, "");

  var company =
    ld.company ||
    text([
      '[data-testid="inlineHeader-companyName"]',
      '[data-company-name="true"]',
      ".jobsearch-CompanyInfoContainer a",
    ]);

  var location =
    ld.location ||
    text([
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
      ".jobsearch-JobInfoHeader-subtitle > div:last-child",
    ]);

  /* A clean, shareable link: the job key from either the job's own page (jk) or the search pane (vjk). */
  var params = new URLSearchParams(window.location.search);
  var jobKey = params.get("jk") || params.get("vjk");
  var link = jobKey ? "https://www.indeed.com/viewjob?jk=" + encodeURIComponent(jobKey) : window.location.href;

  if (!role && !company) {
    alert("Couldn't find a job posting on this page. Open a single Indeed job and try again.");
    return;
  }

  var query = new URLSearchParams({
    source: "Indeed",
    company: company,
    role: role,
    location: location,
    link: link,
  });
  window.open(APP_URL + "?" + query.toString(), "_blank");
})();
