"use client";

import { JOB_STATUSES } from "@/app/lib/jobStatus";
import { JOB_TYPES, APPLY_TYPES, JOB_CATEGORIES } from "@/app/lib/jobFields";
import SegmentedControl from "@/app/components/SegmentedControl";

export type DateFilter = "all" | "week" | "month" | "year";
export type EntryLimit = 5 | 10 | 15 | 25 | 50;

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
];

const ENTRY_LIMIT_OPTIONS: { value: EntryLimit; label: string }[] = ([5, 10, 15, 25, 50] as const).map((n) => ({
  value: n,
  label: String(n),
}));

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

interface ApplicationsFiltersProps {
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  entryLimit: EntryLimit;
  onEntryLimitChange: (value: EntryLimit) => void;
  statusFilter: Set<string>;
  onStatusFilterChange: (next: Set<string>) => void;
  jobTypeFilter: Set<string>;
  onJobTypeFilterChange: (next: Set<string>) => void;
  applyTypeFilter: Set<string>;
  onApplyTypeFilterChange: (next: Set<string>) => void;
  categoryFilter: Set<string>;
  onCategoryFilterChange: (next: Set<string>) => void;
  // Rows matching the filters before the entry limit, for "Showing N of M"; null while loading.
  matchCount: number | null;
}

// The Applications page's filter bar (moved out of the page in Part 120). The page owns the
// filter state; this only renders it and reports changes.
export default function ApplicationsFilters({
  dateFilter,
  onDateFilterChange,
  entryLimit,
  onEntryLimitChange,
  statusFilter,
  onStatusFilterChange,
  jobTypeFilter,
  onJobTypeFilterChange,
  applyTypeFilter,
  onApplyTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  matchCount,
}: ApplicationsFiltersProps) {
  const filterGroups: {
    label: string;
    options: readonly string[];
    selected: Set<string>;
    setSelected: (next: Set<string>) => void;
  }[] = [
    { label: "Status", options: JOB_STATUSES, selected: statusFilter, setSelected: onStatusFilterChange },
    { label: "Job type", options: JOB_TYPES, selected: jobTypeFilter, setSelected: onJobTypeFilterChange },
    { label: "Apply type", options: APPLY_TYPES, selected: applyTypeFilter, setSelected: onApplyTypeFilterChange },
    { label: "Category", options: JOB_CATEGORIES, selected: categoryFilter, setSelected: onCategoryFilterChange },
  ];

  return (
    <section className="mb-5 border border-slate-700 rounded-md bg-slate-900 p-4">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <fieldset>
          <legend className="text-xs text-slate-300 font-semibold mb-2">
            Date applied
          </legend>
          <SegmentedControl options={DATE_FILTER_OPTIONS} value={dateFilter} onChange={onDateFilterChange} />
        </fieldset>

        <fieldset>
          <legend className="text-xs text-slate-300 font-semibold mb-2">
            Show entries
          </legend>
          <SegmentedControl options={ENTRY_LIMIT_OPTIONS} value={entryLimit} onChange={onEntryLimitChange} />
        </fieldset>

        {filterGroups.map((group) => (
          <fieldset key={group.label}>
            <legend className="text-xs text-slate-300 font-semibold mb-2">
              {group.label}
            </legend>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {group.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={group.selected.has(option)}
                    onChange={() =>
                      toggleFilterValue(
                        group.selected,
                        option,
                        group.setSelected,
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
      {matchCount !== null && matchCount > entryLimit && (
        <p className="text-xs text-slate-500 mt-4">
          Showing {entryLimit} of {matchCount}
        </p>
      )}
    </section>
  );
}
