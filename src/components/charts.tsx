"use client";

export function BarRow({
  label,
  value,
  max = 1,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 0.0001)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-display font-semibold tabular-nums">
          {Math.round(value * 10) / 10}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--sand)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  height = 64,
}: {
  values: (number | null)[];
  height?: number;
}) {
  const nums = values.map((v) => (v == null ? null : Number(v)));
  const present = nums.filter((v): v is number => v != null);
  if (present.length < 2) {
    return (
      <p className="text-xs text-[var(--muted)]">Chưa đủ điểm dữ liệu</p>
    );
  }
  const min = Math.min(...present);
  const max = Math.max(...present);
  const w = 280;
  const h = height;
  const pts = nums
    .map((v, i) => {
      if (v == null) return null;
      const x = (i / Math.max(nums.length - 1, 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

export function DayDots({
  series,
}: {
  series: { date: string; on: boolean; soft?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {series.map((d) => (
        <div
          key={d.date}
          title={d.date}
          className={`h-3.5 w-3.5 rounded-sm ${
            d.on
              ? d.soft
                ? "bg-[var(--warn)]"
                : "bg-[var(--accent)]"
              : "bg-[var(--sand)]"
          }`}
        />
      ))}
    </div>
  );
}
