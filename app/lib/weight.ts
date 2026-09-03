export const WEIGHTS = [1, 2, 3, 5, 8] as const;

export type Weight = (typeof WEIGHTS)[number];

export function isWeight(value: unknown): value is Weight {
  return typeof value === "number" && (WEIGHTS as readonly number[]).includes(value);
}

export const weightBadgeStyles: Record<Weight, string> = {
  1: "bg-slate-700 text-slate-400",
  2: "bg-blue-500/10 text-blue-400",
  3: "bg-teal-500/10 text-teal-400",
  5: "bg-yellow-500/10 text-yellow-400",
  8: "bg-red-500/10 text-red-400",
};

export const weightDotColors: Record<Weight, string> = {
  1: "bg-zinc-300",
  2: "bg-blue-400",
  3: "bg-teal-400",
  5: "bg-yellow-400",
  8: "bg-red-400",
};
