export const PRIORITIES = ["none", "low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };

export const priorityBadgeStyles: Record<Priority, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
  none: "bg-zinc-100 text-zinc-500",
};

export const priorityDotColors: Record<Priority, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  none: "bg-zinc-300",
};
