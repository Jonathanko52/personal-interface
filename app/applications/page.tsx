"use client";

import { useEffect, useMemo, useState } from "react";
import { JOB_STATUSES, JobStatus } from "@/app/lib/jobStatus";
import { parseSheetDate } from "@/app/lib/sheetDate";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "@/app/lib/completionStats";

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

type SortField =
  | "company"
  | "role"
  | "location"
  | "dateApplied"
  | "applyType"
  | "jobType"
  | "status";
type SortDirection = "asc" | "desc";
type DateFilter = "all" | "week" | "month" | "year";
type EntryLimit = 5 | 10 | 15 | 25 | 50;

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: SortableHeaderProps) {
  return (
    <th
      onClick={onClick}
      className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2 cursor-pointer select-none hover:text-slate-200 transition-colors">
      {label}
      {active && (
        <span className="ml-1">{direction === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
];

const ENTRY_LIMIT_OPTIONS: EntryLimit[] = [5, 10, 15, 25, 50];

const JOB_TYPE_OPTIONS = ["Internship", "Part-time", "Full-time"] as const;
const APPLY_TYPE_OPTIONS = ["Quick Apply", "Normal Apply"] as const;

function toggleFilterValue(
  current: Set<string>,
  value: string,
  update: (next: Set<string>) => void,
) {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  update(next);
}

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<ApplicationRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRows, setSavingRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [entryLimit, setEntryLimit] = useState<EntryLimit>(25);
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [jobTypeFilter, setJobTypeFilter] = useState<Set<string>>(new Set());
  const [applyTypeFilter, setApplyTypeFilter] = useState<Set<string>>(
    new Set(),
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs) return jobs;

    const now = new Date();
    const cutoff =
      dateFilter === "week"
        ? startOfWeek(now)
        : dateFilter === "month"
          ? startOfMonth(now)
          : dateFilter === "year"
            ? startOfYear(now)
            : null;

    const items = cutoff
      ? jobs.filter((j) => {
          const applied = parseSheetDate(j.dateApplied);
          return applied ? applied >= cutoff : false;
        })
      : [...jobs];

    const filteredItems = items.filter(
      (job) =>
        (statusFilter.size === 0 || statusFilter.has(job.status)) &&
        (jobTypeFilter.size === 0 || jobTypeFilter.has(job.jobType)) &&
        (applyTypeFilter.size === 0 || applyTypeFilter.has(job.applyType)),
    );

    if (sortField) {
      filteredItems.sort((a, b) => {
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
    }

    return filteredItems;
  }, [
    jobs,
    dateFilter,
    statusFilter,
    jobTypeFilter,
    applyTypeFilter,
    sortField,
    sortDirection,
  ]);

  const displayedJobs = useMemo(() => {
    return filteredAndSortedJobs?.slice(0, entryLimit) ?? filteredAndSortedJobs;
  }, [filteredAndSortedJobs, entryLimit]);

  const hasActiveFilters =
    dateFilter !== "all" ||
    statusFilter.size > 0 ||
    jobTypeFilter.size > 0 ||
    applyTypeFilter.size > 0;

  useEffect(() => {
    fetch("/api/jobs/list")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data) => setJobs([...data.jobs].reverse()))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Something went wrong."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleFieldChange(
    row: number,
    field: "applyType" | "jobType" | "status",
    value: string,
  ) {
    const prevJobs = jobs;
    setJobs(
      (cur) => cur?.map((j) => (j.row === row ? { ...j, [field]: value } : j)) ?? cur,
    );
    setSavingRows((prev) => new Set(prev).add(row));
    try {
      const res = await fetch(
        field === "status" ? "/api/jobs/status" : "/api/jobs/field",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            field === "status" ? { row, status: value } : { row, field, value },
          ),
        },
      );
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

      <section className="mb-5 border border-slate-700 rounded-md bg-slate-900 p-4">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <fieldset>
            <legend className="text-xs text-slate-300 font-semibold mb-2">
              Date applied
            </legend>
            <div className="flex flex-wrap gap-1">
              {DATE_FILTER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDateFilter(o.value)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    dateFilter === o.value
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs text-slate-300 font-semibold mb-2">
              Show entries
            </legend>
            <div className="flex flex-wrap gap-1">
              {ENTRY_LIMIT_OPTIONS.map((limit) => (
                <button
                  key={limit}
                  onClick={() => setEntryLimit(limit)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    entryLimit === limit
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                  }`}>
                  {limit}
                </button>
              ))}
            </div>
          </fieldset>

          {[
            ["Status", JOB_STATUSES, statusFilter, setStatusFilter],
            ["Job type", JOB_TYPE_OPTIONS, jobTypeFilter, setJobTypeFilter],
            [
              "Apply type",
              APPLY_TYPE_OPTIONS,
              applyTypeFilter,
              setApplyTypeFilter,
            ],
          ].map(([label, options, selected, setSelected]) => (
            <fieldset key={label as string}>
              <legend className="text-xs text-slate-300 font-semibold mb-2">
                {label as string}
              </legend>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {(options as readonly string[]).map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(selected as Set<string>).has(option)}
                      onChange={() =>
                        toggleFilterValue(
                          selected as Set<string>,
                          option,
                          setSelected as (next: Set<string>) => void,
                        )
                      }
                      className="accent-slate-500"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {filteredAndSortedJobs && filteredAndSortedJobs.length > entryLimit && (
          <p className="text-xs text-slate-500 mt-4">
            Showing {entryLimit} of {filteredAndSortedJobs.length}
          </p>
        )}
      </section>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !jobs || jobs.length === 0 ? (
        <p className="text-sm text-slate-400">No applications yet.</p>
      ) : !displayedJobs || displayedJobs.length === 0 ? (
        <p className="text-sm text-slate-400">
          {hasActiveFilters
            ? "No applications match the selected filters."
            : "No applications to display."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-700 bg-slate-900 rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <SortableHeader
                  label="Company"
                  active={sortField === "company"}
                  direction={sortDirection}
                  onClick={() => handleSort("company")}
                />
                <SortableHeader
                  label="Role"
                  active={sortField === "role"}
                  direction={sortDirection}
                  onClick={() => handleSort("role")}
                />
                <SortableHeader
                  label="Location"
                  active={sortField === "location"}
                  direction={sortDirection}
                  onClick={() => handleSort("location")}
                />
                <SortableHeader
                  label="Date"
                  active={sortField === "dateApplied"}
                  direction={sortDirection}
                  onClick={() => handleSort("dateApplied")}
                />
                <SortableHeader
                  label="Apply Type"
                  active={sortField === "applyType"}
                  direction={sortDirection}
                  onClick={() => handleSort("applyType")}
                />
                <SortableHeader
                  label="Job Type"
                  active={sortField === "jobType"}
                  direction={sortDirection}
                  onClick={() => handleSort("jobType")}
                />
                <th className="text-left font-semibold text-slate-400 uppercase tracking-wider text-xs px-3 py-2">
                  Posting
                </th>
                <SortableHeader
                  label="Status"
                  active={sortField === "status"}
                  direction={sortDirection}
                  onClick={() => handleSort("status")}
                />
              </tr>
            </thead>
            <tbody>
              {(displayedJobs ?? []).map((job) => (
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
                  <td className="px-3 py-2">
                    <select
                      value={job.applyType}
                      onChange={(e) =>
                        handleFieldChange(job.row, "applyType", e.target.value)
                      }
                      disabled={savingRows.has(job.row)}
                      className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white disabled:opacity-60">
                      {APPLY_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={job.jobType}
                      onChange={(e) =>
                        handleFieldChange(job.row, "jobType", e.target.value)
                      }
                      disabled={savingRows.has(job.row)}
                      className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white disabled:opacity-60">
                      {JOB_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
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
                        handleFieldChange(job.row, "status", e.target.value)
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
