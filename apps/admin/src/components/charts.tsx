"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Bitta seriyali grafiklar uchun rang — dataviz validatoridan o'tgan
// (oq fonda kontrast ≥ 3:1). Matn hech qachon shu rangda bo'lmaydi.
const BAR = "#4f46e5";
const BAR_HOVER = "#6366f1";
const GRID = "#e5e7eb";
const TICK = "#6b7280";

/** 1 250 000 -> "1.3 mln", 42 000 -> "42 ming" */
export function compact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + " mln";
  if (abs >= 1e3) return Math.round(n / 1e3) + " ming";
  return String(Math.round(n));
}

/** "2026-09-11" -> "11.09" */
export function shortDay(day: string): string {
  return `${day.slice(8, 10)}.${day.slice(5, 7)}`;
}

export function longDay(day: string): string {
  return `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}`;
}

/** O'sish foizi; oldingi davr 0 bo'lsa null (foiz ma'nosiz). */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * p;
}

export interface BarPoint {
  label: string;
  value: number;
  title?: string;
}

/** Bitta seriyali ustunli grafik: yumaloq uchlar, hairline gridlar, hover tooltip. */
export function BarChart({
  data,
  height = 180,
  format = compact,
  tooltipValue,
}: {
  data: BarPoint[];
  height?: number;
  format?: (v: number) => string;
  tooltipValue?: (p: BarPoint) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padL = 52;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const max = niceCeil(Math.max(0, ...data.map((d) => d.value)));
  const slot = data.length ? innerW / data.length : innerW;
  const barW = Math.max(3, Math.min(24, slot - 2));
  const baseY = padT + innerH;
  const xOf = (i: number) => padL + i * slot + (slot - barW) / 2;
  const yOf = (v: number) => baseY - (v / max) * innerH;
  const every = Math.max(1, Math.ceil(data.length / 6));
  const hovered = hover != null ? data[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={width} height={height} className="block">
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={width - padR}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={yOf(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={TICK}
            >
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = xOf(i);
          const y = yOf(d.value);
          const h = baseY - y;
          const r = Math.min(4, h);
          const path =
            h <= 0
              ? null
              : `M${x},${baseY} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${baseY} Z`;
          const showLabel =
            data.length <= 12 || i % every === 0 || i === data.length - 1;
          return (
            <g key={i}>
              {path && <path d={path} fill={hover === i ? BAR_HOVER : BAR} />}
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill={TICK}
                >
                  {d.label}
                </text>
              )}
              <rect
                x={padL + i * slot}
                y={padT}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hovered && hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 text-white px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{ left: xOf(hover) + barW / 2, top: yOf(hovered.value) - 6 }}
        >
          <div className="font-semibold text-sm">
            {tooltipValue ? tooltipValue(hovered) : format(hovered.value)}
          </div>
          <div className="text-xs text-gray-300">{hovered.title ?? hovered.label}</div>
        </div>
      )}
    </div>
  );
}

/** Statistika plitkasi: yorliq, qiymat, ixtiyoriy o'zgarish foizi. */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  hint,
  highlight,
}: {
  label: string;
  value: ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {delta != null && (
        <div
          className={`text-xs mt-1 font-medium ${
            delta > 0
              ? "text-green-700"
              : delta < 0
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta}%{" "}
          {deltaLabel && (
            <span className="text-gray-400 font-normal">{deltaLabel}</span>
          )}
        </div>
      )}
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

/** Gorizontal chiziqlar ro'yxati — kategoriyalar bo'yicha miqdor (bitta rang). */
export function HBars({
  rows,
  format = (v) => String(v),
  emptyText = "—",
}: {
  rows: { label: ReactNode; value: number; sub?: string }[];
  format?: (v: number) => string;
  emptyText?: string;
}) {
  if (rows.length === 0) {
    return <div className="text-sm text-gray-400 py-6 text-center">{emptyText}</div>;
  }
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm mb-1 gap-3">
            <span className="truncate min-w-0">{r.label}</span>
            <span className="font-medium tabular-nums whitespace-nowrap">
              {format(r.value)}
              {r.sub && (
                <span className="text-gray-400 font-normal ml-1.5">{r.sub}</span>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: BAR }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Limit o'lchagichi: 70% dan sariq, 90% dan qizil. */
export function Meter({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const color = pct >= 90 ? "#dc2626" : pct >= 70 ? "#d97706" : BAR;
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
