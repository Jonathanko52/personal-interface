"use client";

import { useEffect, useMemo, useState } from "react";
import { JOB_STATUSES, JobStatus } from "@/app/lib/jobStatus";
import { parseSheetDate } from "@/app/lib/sheetDate";

interface ApplicationRow {
  row: number;
  company: string;
  role: string;
  location: string;
  dateApplied: string;
  postingLink: string;
  applyType: string;
  jobType: string;
  status: JobStatus;
}

type SortField = "company" | "role" | "location" | "dateApplied" | "applyType" | "jobType" | "status";
type SortDirection = "asc" | "desc";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}

function SortableHeader({ label, active, direction, onClick }: SortableHeaderProps) {
  return (
    <th
      onClick={onClick}
      className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2 cursor-pointer select-none hover:text-slate-200 transition-colors">
      {label}
      {active && <span className="ml-1">{direction === "asc" ? "▲" : "▼"}</span>}
    </th>
  );
}

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<ApplicationRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRows, setSavingRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const sortedJobs = useMemo(() => {
    if (!jobs || !sortField) return jobs;
    const items = [...jobs];
    items.sort((a, b) => {
      let cmp: number;
      if (sortField === "dateApplied") {
        const da = parseSheetDate(a.dateApplied);
        const db = parseSheetDate(b.dateApplied);
        cmp = (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
      } else {
        cmp = a[sortField].localeCompare(b[sortField]);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return items;
  }, [jobs, sortField, sortDirection]);

  useEffect(() => {
    fetch("/api/jobs/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data) => setJobs([...data.jobs].reverse()))
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(row: number, status: JobStatus) {
    const prevJobs = jobs;
    setJobs((cur) => cur?.map((j) => (j.row === row ? { ...j, status } : j)) ?? cur);
    setSavingRows((prev) => new Set(prev).add(row));
    try {
      const res = await fetch("/api/jobs/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setJobs(prevJobs);
    } finally {
      setSavingRows((prev) => {
        const next = new Set(prev);
        next.delete(row);
        return next;
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-sm text-slate-400 mb-6">
        Applications
      </h1>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !jobs || jobs.length === 0 ? (
        <p className="text-sm text-slate-400">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-700 bg-slate-900 rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Company
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Role
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Location
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Date
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Apply Type
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Job Type
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Posting
                </th>
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.row}
                  className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-3 py-2 text-slate-400 font-medium">
                    {job.company}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{job.role}</td>
                  <td className="px-3 py-2 text-slate-400">{job.location}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {job.dateApplied}
                  </td>
                  <td className="px-3 py-2 text-slate-400">{job.applyType}</td>
                  <td className="px-3 py-2 text-slate-400">{job.jobType}</td>
                  <td className="px-3 py-2">
                    {job.postingLink ? (
                      <a
                        href={job.postingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline">
                        Link
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={job.status}
                      onChange={(e) =>
                        handleStatusChange(job.row, e.target.value as JobStatus)
                      }
                      disabled={savingRows.has(job.row)}
                      className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white disabled:opacity-60">
                      {JOB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
