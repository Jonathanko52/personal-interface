"use client";

import { useEffect, useState } from "react";
import { ApplyTypeCode, JobTypeCode, JobCategory, JobSource } from "./jobFields";

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
}

const JOB_STACK_KEY = "jobStack";

function load(): StackedJob[] {
  try {
    const raw = localStorage.getItem(JOB_STACK_KEY);
    return raw ? (JSON.parse(raw) as StackedJob[]) : [];
  } catch {
    return [];
  }
}

function save(stack: StackedJob[]) {
  try {
    localStorage.setItem(JOB_STACK_KEY, JSON.stringify(stack));
  } catch {}
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
