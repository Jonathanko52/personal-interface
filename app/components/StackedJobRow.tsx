"use client";

import { StackedJob } from "@/app/lib/useJobStack";
import { useJobSaveFlow } from "@/app/lib/useJobSaveFlow";
import { APPLY_TYPE_LABELS, JOB_TYPE_LABELS } from "@/app/lib/jobFields";

interface StackedJobRowProps {
  item: StackedJob;
  onSaved: () => void;
  onRemove: () => void;
  onEdit: () => void;
  skipped: boolean;
}

// Stack items are already fully filled out by the time they're added (the form enforces
// Company/Role/Location before "Add to stack" is enabled), so isValid is always true here.
export default function StackedJobRow({ item, onSaved, onRemove, onEdit, skipped }: StackedJobRowProps) {
  const { checking, saving, confirmDuplicate, setConfirmDuplicate, checkFailed, error, handleSaveClick, doSave } =
    useJobSaveFlow({
      isValid: true,
      getCompanyName: () => item.companyName,
      buildPayload: () => ({
        companyName: item.companyName,
        jobPosting: item.jobPosting,
        location: item.location,
        postingLink: item.postingLink,
        applyType: item.applyType,
        jobType: item.jobType,
        source: item.source,
        categories: item.categories,
      }),
      onSaved,
    });

  return (
    <div className="flex flex-col gap-2 border border-zinc-200 rounded-md p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <p className="font-medium text-zinc-700">{item.companyName}</p>
          {item.postingLink.trim() !== "" ? (
            <a
              href={item.postingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              {item.jobPosting}
            </a>
          ) : (
            <p className="text-zinc-600">{item.jobPosting}</p>
          )}
          <p className="text-xs text-zinc-400">
            {item.location} · {JOB_TYPE_LABELS[item.jobType]} · {APPLY_TYPE_LABELS[item.applyType]} · {item.source}
          </p>
          {item.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.categories.map((category) => (
                <span key={category} className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={onEdit}
            disabled={checking || saving}
            className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors disabled:opacity-40"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            disabled={checking || saving}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>

      {skipped && (
        <p className="text-xs text-yellow-600">
          Skipped during &quot;Save all&quot; (duplicate or error) — save individually to confirm.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {confirmDuplicate ? (
        <div className="flex flex-col gap-2 border border-yellow-400 bg-yellow-50 rounded-md p-2">
          <p className="text-xs text-yellow-800">
            You already submitted to {item.companyName} within the last week. Save anyway?
          </p>
          <div className="flex gap-2">
            <button
              onClick={doSave}
              disabled={saving}
              className="text-xs bg-indigo-500 text-white rounded-md px-2.5 py-1 hover:bg-indigo-600 transition-colors disabled:opacity-40"
            >
              {saving ? "Saving..." : "Yes, save anyway"}
            </button>
            <button
              onClick={() => setConfirmDuplicate(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              No, cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSaveClick}
          disabled={checking || saving}
          className="self-start text-xs bg-zinc-800 text-white rounded-md px-3 py-1.5 hover:bg-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {checking ? "Checking..." : saving ? "Saving..." : "Save"}
        </button>
      )}
      {checkFailed && (
        <p className="text-xs text-yellow-600">Couldn&apos;t check for recent submissions — saving anyway.</p>
      )}
    </div>
  );
}
