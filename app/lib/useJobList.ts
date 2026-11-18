"use client";

import { useEffect, useState } from "react";

// Loads the Sheet's job rows from /api/jobs/list once on mount (Part 117), shared by the
// Metrics and Applications pages. Rows come back in Sheet order (oldest first). `setJobs` is
// exposed so a page can update rows in place after editing them.
export function useJobList<T>() {
  const [jobs, setJobs] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  return { jobs, setJobs, loading, error };
}
