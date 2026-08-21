"use client";

import { useState } from "react";
import { JOB_STATUSES, JobStatus } from "@/app/lib/jobStatus";

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

const DUMMY_JOBS: ApplicationRow[] = [
  { row: 2, company: "Acme Corp", role: "Frontend Engineer", location: "Remote", dateApplied: "08/01/26", postingLink: "https://linkedin.com/jobs/view/1", applyType: "Normal Apply", jobType: "Full-time", status: "Applied" },
  { row: 3, company: "Globex", role: "Product Designer", location: "New York, NY", dateApplied: "08/05/26", postingLink: "https://linkedin.com/jobs/view/2", applyType: "Quick Apply", jobType: "Full-time", status: "Interviewing" },
  { row: 4, company: "Initech", role: "Backend Intern", location: "Austin, TX", dateApplied: "08/08/26", postingLink: "https://linkedin.com/jobs/view/3", applyType: "Normal Apply", jobType: "Internship", status: "Applied" },
  { row: 5, company: "Umbrella Inc", role: "Data Analyst", location: "Chicago, IL", dateApplied: "08/10/26", postingLink: "https://linkedin.com/jobs/view/4", applyType: "Quick Apply", jobType: "Part-time", status: "Offer" },
  { row: 6, company: "Soylent Co", role: "QA Engineer", location: "Remote", dateApplied: "08/12/26", postingLink: "https://linkedin.com/jobs/view/5", applyType: "Normal Apply", jobType: "Full-time", status: "Rejected" },
  { row: 7, company: "Hooli", role: "Mobile Developer", location: "San Francisco, CA", dateApplied: "08/15/26", postingLink: "https://linkedin.com/jobs/view/6", applyType: "Quick Apply", jobType: "Full-time", status: "Applied" },
];

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<ApplicationRow[]>(DUMMY_JOBS);

  function handleStatusChange(row: number, status: JobStatus) {
    setJobs((prev) => prev.map((j) => (j.row === row ? { ...j, status } : j)));
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Applications</h1>

      {jobs.length === 0 ? (
        <p className="text-sm text-zinc-400">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Company</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Role</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Location</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Date</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Apply Type</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Job Type</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Posting</th>
                <th className="text-left font-semibold text-zinc-400 uppercase tracking-wider text-xs px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.row} className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-3 py-2 text-zinc-900 font-medium">{job.company}</td>
                  <td className="px-3 py-2 text-zinc-700">{job.role}</td>
                  <td className="px-3 py-2 text-zinc-700">{job.location}</td>
                  <td className="px-3 py-2 text-zinc-500">{job.dateApplied}</td>
                  <td className="px-3 py-2 text-zinc-500">{job.applyType}</td>
                  <td className="px-3 py-2 text-zinc-500">{job.jobType}</td>
                  <td className="px-3 py-2">
                    <a
                      href={job.postingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:underline"
                    >
                      Link
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.row, e.target.value as JobStatus)}
                      className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none text-zinc-700 bg-white"
                    >
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
