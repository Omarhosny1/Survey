"use client";

import { useId, useMemo, useState } from "react";
import { cn, formatCompact, formatNumber } from "@/app/_lib/utils";

interface ChartPoint {
  label: string;
  value: number;
  previousValue?: number;
}

interface AreaChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  showComparison?: boolean;
  className?: string;
  valueLabel?: string;
}

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;
  let path = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function AreaChart({
  data,
  height = 240,
  color = "#0d5947",
  showComparison = false,
  className,
  valueLabel = "responses",
}: AreaChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const width = 720;
  const padding = { top: 18, right: 14, bottom: 30, left: 38 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((point) =>
    showComparison ? [point.value, point.previousValue ?? 0] : [point.value],
  );
  const rawMax = Math.max(...allValues, 1);
  const max = Math.max(4, Math.ceil((rawMax * 1.18) / 4) * 4);

  const points = data.map((point, index) => ({
    x: padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth,
    y: padding.top + innerHeight - (point.value / max) * innerHeight,
  }));

  const comparisonPoints = data.map((point, index) => ({
    x: padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth,
    y: padding.top + innerHeight - ((point.previousValue ?? 0) / max) * innerHeight,
  }));

  const line = smoothPath(points);
  const comparisonLine = smoothPath(comparisonPoints);
  const bottom = padding.top + innerHeight;
  const area = `${line} L ${points[points.length - 1]?.x ?? padding.left} ${bottom} L ${points[0]?.x ?? padding.left} ${bottom} Z`;
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const activeDatum = activeIndex !== null ? data[activeIndex] : null;
  const labelStride = Math.max(1, Math.ceil(data.length / 6));

  const summary = useMemo(
    () =>
      data
        .map((point) => `${point.label}: ${point.value} ${valueLabel}`)
        .join(". "),
    [data, valueLabel],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Response activity chart. ${summary}`}
      >
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="72%" stopColor={color} stopOpacity="0.045" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((fraction) => {
          const y = padding.top + innerHeight * fraction;
          return (
            <g key={fraction}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e5e0d4"
                strokeDasharray="2 6"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="#8a968f"
                fontFamily="var(--font-mono)"
              >
                {formatCompact(Math.round(max * (1 - fraction)))}
              </text>
            </g>
          );
        })}

        {showComparison && (
          <path
            d={comparisonLine}
            fill="none"
            stroke="#b9b1a1"
            strokeWidth="1.6"
            strokeDasharray="3 5"
            strokeLinecap="round"
            opacity="0.75"
          />
        )}

        <path d={area} fill={`url(#${gradientId}-fill)`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={padding.top}
              y2={bottom}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.35"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="6" fill={color} opacity="0.15" />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="3.2"
              fill="#ffffff"
              stroke={color}
              strokeWidth="2.4"
            />
          </g>
        )}

        {data.map((point, index) => {
          const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
          const segment = innerWidth / Math.max(data.length - 1, 1);
          return (
            <rect
              key={`${point.label}-${index}`}
              x={x - segment / 2}
              y={padding.top}
              width={segment}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          );
        })}

        {data.map((point, index) => {
          if (index % labelStride !== 0 && index !== data.length - 1) return null;
          const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
          return (
            <text
              key={`label-${point.label}-${index}`}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#8a968f"
              fontFamily="var(--font-mono)"
            >
              {point.label}
            </text>
          );
        })}
      </svg>

      {activePoint && activeDatum && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-surface px-2.5 py-1.5 shadow-lift"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100 - 3}%`,
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
            {activeDatum.label}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-xs font-semibold text-ink">
            {formatNumber(activeDatum.value)} {valueLabel}
          </p>
          {showComparison && activeDatum.previousValue !== undefined && (
            <p className="text-[10px] text-ink-faint">
              {formatNumber(activeDatum.previousValue)} previous
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "#0d5947",
  className,
  width = 92,
  height = 30,
}: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const points = data.map((value, index) => ({
    x: (index / Math.max(data.length - 1, 1)) * width,
    y: height - 3 - ((value - min) / range) * (height - 6),
  }));
  const line = smoothPath(points);
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path d={area} fill={color} opacity="0.09" />
      <path d={line} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={points[points.length - 1]?.x}
        cy={points[points.length - 1]?.y}
        r="2"
        fill={color}
      />
    </svg>
  );
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue: string;
  centerLabel: string;
  className?: string;
}

export function DonutChart({
  data,
  size = 148,
  thickness = 14,
  centerValue,
  centerLabel,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, segment) => sum + segment.value, 0);
  let cursor = 0;
  const stops = data.map((segment) => {
    const start = total > 0 ? (cursor / total) * 100 : 0;
    cursor += segment.value;
    const end = total > 0 ? (cursor / total) * 100 : 0;
    return `${segment.color} ${start}% ${end}%`;
  });
  const gradient = total > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#e5e0d4 0% 100%)";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${centerLabel}: ${centerValue}. ${data
        .map((segment) => `${segment.label}: ${segment.value}`)
        .join(", ")}`}
    >
      <div
        className="h-full w-full rounded-full transition-[background] duration-500"
        style={{ background: gradient }}
      />
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-surface text-center"
        style={{ width: size - thickness * 2, height: size - thickness * 2 }}
      >
        <span className="font-display text-2xl leading-none tracking-tight text-ink">{centerValue}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-faint">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

interface BarListItem {
  label: string;
  value: number;
  meta?: string;
  color?: string;
}

interface BarListProps {
  items: BarListItem[];
  max?: number;
  showValue?: boolean;
  className?: string;
  suffix?: string;
}

export function BarList({ items, max, showValue = true, className, suffix }: BarListProps) {
  const computedMax = max ?? Math.max(...items.map((item) => item.value), 1);
  return (
    <div className={cn("space-y-3.5", className)}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[12.5px] text-ink-soft">{item.label}</span>
            <span className="shrink-0 font-mono text-[11px] font-medium text-ink">
              {showValue ? formatNumber(item.value) : item.meta}
              {showValue && suffix ? <span className="ml-0.5 text-ink-faint">{suffix}</span> : null}
              {showValue && item.meta ? (
                <span className="ml-1.5 text-ink-faint">{item.meta}</span>
              ) : null}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas-deep/80">
            <div
              className="bar-grow h-full rounded-full"
              style={{
                width: `${computedMax > 0 ? Math.max((item.value / computedMax) * 100, item.value > 0 ? 3 : 0) : 0}%`,
                backgroundColor: item.color ?? "#0d5947",
                animationDelay: `${index * 45}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface HeatStripProps {
  values: number[];
  labels: string[];
  color?: string;
}

export function HeatStrip({ values, labels, color = "#0d5947" }: HeatStripProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {values.map((value, index) => (
        <div key={`${labels[index]}-${index}`} className="group flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-[3px_3px_1px_1px] transition-opacity group-hover:opacity-80"
            style={{
              height: `${Math.max(6, (value / max) * 44)}px`,
              backgroundColor: color,
              opacity: 0.18 + (value / max) * 0.82,
            }}
            title={`${labels[index]}: ${value}`}
          />
          <span className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            {labels[index]}
          </span>
        </div>
      ))}
    </div>
  );
}
