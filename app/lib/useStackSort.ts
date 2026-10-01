"use client";

import { useState, useMemo } from "react";
import { StackedJob } from "./useJobStack";

export type StackSortOption = "default" | "score" | "company" | "role";

export function useStackSort(stack: StackedJob[]) {
  const [sort, setSort] = useState<StackSortOption>("default");

  const result = useMemo(() => {
    if (sort === "default") return stack;
    const items = [...stack];
    if (sort === "score") {
      items.sort((a, b) => {
        if (a.matchScore === null && b.matchScore === null) return 0;
        if (a.matchScore === null) return 1;
        if (b.matchScore === null) return -1;
        return b.matchScore - a.matchScore; // highest first
      });
    } else if (sort === "company") {
      items.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sort === "role") {
      items.sort((a, b) => a.jobPosting.localeCompare(b.jobPosting));
    }
    return items;
  }, [stack, sort]);

  return { result, sort, setSort };
}
