"use client";

import { useEffect, useRef, useState } from "react";
import { formatShortDay } from "../lib/date";

// One stacked layer of the chart. `values` lines up with `days`; null means no data for that
// day (e.g. a future day), which draws nothing and has no tooltip.
export interface BarSeries {
  label: string;
  color: string;
  values: (number | null)[];
}

const HEIGHT = 160;
const PAD = { top: 8, right: 4, bottom: 20, left: 28 };
const GAP = 2; // surface gap between stacked segments
const RADIUS = 4; // rounded data end (top of the stack only)

// Smallest whole-number step that fits `max` in about four gridlines.
function yScale(max: number): { top: number; ticks: number[] } {
  const step = Math.max(1, Math.ceil(max / 4));
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += step) ticks.push(t);
  return { top, ticks };
}

// A bar with only its top corners rounded, anchored to the baseline.
function topRoundedBar(x: number, y: number, w: number, h: number): string {
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

// Hand-written SVG bar chart for the Metrics page (Part 108); the project has no chart library.
// One bar per day, layers stacked bottom-up in `series` order, a hover tooltip per day, and a
// legend when there's more than one series. Width follows the container.
export default function BarChart({ days, series }: { days: string[]; series: BarSeries[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totals = days.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const hasData = days.map((_, i) => series.some((s) => s.values[i] !== null));
  const { top, ticks } = yScale(Math.max(0, ...totals));

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const colW = days.length ? plotW / days.length : 0;
  const barW = Math.max(2, Math.min(colW * 0.6, 20));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;

  const hoveredDay = hovered !== null && hasData[hovered] ? hovered : null;

  return (
    <div className="flex flex-col gap-2">
      {series.length > 1 && (
        <div className="flex gap-4 text-xs text-zinc-500">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div ref={containerRef} className="relative" onMouseLeave={() => setHovered(null)}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden="true">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#e4e4e7" strokeWidth={1} />
                <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="#a1a1aa">
                  {t}
                </text>
              </g>
            ))}
            {days.map((day, i) => {
              const x = PAD.left + i * colW;
              const dayOfMonth = Number(day.slice(8));
              let base = 0;
              const stacked = series
                .map((s) => ({ color: s.color, value: s.values[i] ?? 0 }))
                .filter((seg) => seg.value > 0);
              return (
                <g key={day}>
                  {hoveredDay === i && <rect x={x} y={PAD.top} width={colW} height={plotH} fill="#f4f4f5" />}
                  {stacked.map((seg, j) => {
                    const yTop = y(base + seg.value);
                    // Every segment but the bottom one gives up GAP px to separate it from the one below.
                    const h = y(base) - yTop - (j > 0 ? GAP : 0);
                    base += seg.value;
                    const bx = x + (colW - barW) / 2;
                    return j === stacked.length - 1 ? (
                      <path key={j} d={topRoundedBar(bx, yTop, barW, h)} fill={seg.color} />
                    ) : (
                      <rect key={j} x={bx} y={yTop} width={barW} height={h} fill={seg.color} />
                    );
                  })}
                  {(dayOfMonth === 1 || dayOfMonth % 5 === 0) && (
                    <text x={x + colW / 2} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="#a1a1aa">
                      {dayOfMonth}
                    </text>
                  )}
                  {/* Hit target: the whole column, taller and wider than the bar. */}
                  <rect
                    x={x}
                    y={PAD.top}
                    width={colW}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHovered(i)}
                  />
                </g>
              );
            })}
          </svg>
        )}
        {hoveredDay !== null && (
          <div
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-white border border-zinc-200 rounded-md shadow-sm px-2.5 py-1.5 text-xs text-zinc-700 whitespace-nowrap"
            style={{
              left: Math.min(Math.max(PAD.left + (hoveredDay + 0.5) * colW, 60), width - 60),
              top: Math.max(y(totals[hoveredDay]) - 6, 40),
            }}
          >
            <div className="font-medium">{formatShortDay(days[hoveredDay])}</div>
            {series.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {series.length > 1 && <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />}
                <span className="text-zinc-500">{s.label}</span>
                <span className="ml-auto pl-3 tabular-nums">{s.values[hoveredDay] ?? 0}</span>
              </div>
            ))}
            {series.length > 1 && (
              <div className="flex border-t border-zinc-100 mt-1 pt-1">
                <span className="text-zinc-500">Total</span>
                <span className="ml-auto pl-3 tabular-nums font-medium">{totals[hoveredDay]}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <thead>
          <tr>
            <th>Date</th>
            {series.map((s) => (
              <th key={s.label}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, i) =>
            hasData[i] ? (
              <tr key={day}>
                <td>{formatShortDay(day)}</td>
                {series.map((s) => (
                  <td key={s.label}>{s.values[i] ?? 0}</td>
                ))}
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
}
