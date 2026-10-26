export const PRIORITIES = ["none", "low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const DEFAULT_PRIORITY: Priority = "none";

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}

export const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };

export const priorityBadgeStyles: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  low: "bg-blue-500/10 text-blue-400",
  none: "bg-slate-700 text-slate-400",
};

// Todo row body (TodoList.tsx). Solid dark tints, not the badges' /10 translucency: the rows are
// dark cards on a light page, so a translucent tint would let the page show through.
export const priorityRowStyles: Record<Priority, string> = {
  high: "bg-red-950 border-red-800 hover:border-red-700",
  medium: "bg-yellow-950 border-yellow-800 hover:border-yellow-700",
  low: "bg-slate-900 border-slate-700 hover:border-slate-600",
  none: "bg-slate-900 border-slate-700 hover:border-slate-600",
};

export const priorityDotColors: Record<Priority, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  none: "bg-zinc-300",
};
