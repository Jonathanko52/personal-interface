"use client";

import { LABEL_CLASS, INPUT_CLASS } from "./JobFields";

interface JobIdentityFieldsProps {
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  jobPosting: string;
  onJobPostingChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  postingLink: string;
  onPostingLinkChange: (value: string) => void;
}

// Company/Role/Location/Posting Link, split out of JobFields.tsx (Part 74) so a caller can
// place its submit button between this group and the rest of JobFields' fields.
export default function JobIdentityFields({
  companyName,
  onCompanyNameChange,
  jobPosting,
  onJobPostingChange,
  location,
  onLocationChange,
  postingLink,
  onPostingLinkChange,
}: JobIdentityFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={LABEL_CLASS}>Company</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={LABEL_CLASS}>Role</label>
        <input
          type="text"
          value={jobPosting}
          onChange={(e) => onJobPostingChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={LABEL_CLASS}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={LABEL_CLASS}>Posting Link (optional)</label>
        <input
          type="url"
          value={postingLink}
          onChange={(e) => onPostingLinkChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
