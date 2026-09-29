"use client";

import { useEffect, useState } from "react";
import { ApplyTypeCode, JobTypeCode, JobCategory, JobSource } from "./jobFields";
import { readJSON, writeJSON } from "./storage";

export interface StackedJob {
  id: string;
  companyName: string;
  jobPosting: string;
  location: string;
  postingLink: string;
  applyType: ApplyTypeCode;
  jobType: JobTypeCode;
  source: JobSource;
  categories: JobCategory[];
  matchScore: number | null;
}

const JOB_STACK_KEY = "jobStack";

function load(): StackedJob[] {
  // Items staged before Match score existed have no such field at runtime despite the cast.
  return readJSON(JOB_STACK_KEY, [] as StackedJob[]).map((item) => ({
    ...item,
    matchScore: item.matchScore ?? null,
  }));
}

function save(stack: StackedJob[]) {
  writeJSON(JOB_STACK_KEY, stack);
}

export function useJobStack() {
  const [stack, setStack] = useState<StackedJob[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Client-only read, same SSR reasoning as this app's other localStorage-backed state
    // (DataContext.tsx, jobCounts.ts) — localStorage isn't available during SSR.
    setStack(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(stack);
  }, [stack, hydrated]);

  function addToStack(entry: Omit<StackedJob, "id">) {
    setStack((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev]);
  }

  function removeFromStack(id: string) {
    setStack((prev) => prev.filter((item) => item.id !== id));
  }

  function updateStackItem(id: string, patch: Partial<Omit<StackedJob, "id">>) {
    setStack((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function clearStack() {
    setStack([]);
  }

  return { stack, addToStack, removeFromStack, updateStackItem, clearStack };
}
