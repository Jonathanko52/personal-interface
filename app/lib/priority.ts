export const PRIORITIES = ["none", "low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };

export const priorityBadgeStyles: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  low: "bg-blue-500/10 text-blue-400",
  none: "bg-slate-700 text-slate-400",
};

export const priorityDotColors: Record<Priority, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  none: "bg-zinc-300",
};
