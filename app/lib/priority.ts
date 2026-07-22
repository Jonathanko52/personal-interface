export const PRIORITIES = ["none", "low", "medium", "high"] as const;

export const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };

export const priorityBadgeStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
  none: "bg-zinc-100 text-zinc-500",
};

export const priorityDotColors: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-yellow-400",
  low: "bg-blue-400",
  none: "bg-zinc-300",
};
