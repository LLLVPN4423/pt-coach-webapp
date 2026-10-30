"use client";

/** Simple body schematic — highlight primary (accent) + secondary (soft) muscles. */
const ZONES: { id: string; aliases: string[]; d: string; label: string }[] = [
  {
    id: "chest",
    aliases: ["chest"],
    d: "M38 28c8-6 16-6 24 0v14c-8 6-16 6-24 0V28z",
    label: "Ngực",
  },
  {
    id: "shoulders",
    aliases: ["shoulders"],
    d: "M28 26c-6 2-8 10-6 16h10V30c0-2-1-4-4-4zm44 0c6 2 8 10 6 16H68V30c0-2 1-4 4-4z",
    label: "Vai",
  },
  {
    id: "arms",
    aliases: ["biceps", "triceps", "forearms"],
    d: "M22 42c-3 8-4 18-2 28h8V44c0-2-2-4-6-2zm56 0c3 8 4 18 2 28h-8V44c0-2 2-4 6-2z",
    label: "Tay",
  },
  {
    id: "core",
    aliases: ["abdominals"],
    d: "M40 44h20v22c-4 4-16 4-20 0V44z",
    label: "Core",
  },
  {
    id: "back",
    aliases: ["lats", "middleBack", "traps"],
    d: "M36 30h28v18c-6 4-22 4-28 0V30z",
    label: "Lưng",
  },
  {
    id: "posterior",
    aliases: ["glutes", "hamstrings", "lowerBack"],
    d: "M38 66h24v10c-4 6-20 6-24 0V66z",
    label: "Mông/sau",
  },
  {
    id: "legs",
    aliases: ["quadriceps", "calves", "abductors", "adductors"],
    d: "M38 78h10v28H36V80c0-2 1-2 2-2zm14 0h10c1 0 2 0 2 2v26H52V78z",
    label: "Chân",
  },
];

function hit(aliases: string[], muscles: string[]) {
  const set = new Set(muscles.map((m) => m.toLowerCase()));
  return aliases.some((a) => set.has(a.toLowerCase()));
}

export function MuscleMap({
  primary = [],
  secondary = [],
  className = "",
}: {
  primary?: string[];
  secondary?: string[];
  className?: string;
}) {
  const primaryHits = ZONES.filter((z) => hit(z.aliases, primary));
  const labels = [
    ...primary.map((m) => m),
    ...secondary.map((m) => m),
  ].slice(0, 6);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 110"
        className="h-28 w-24 shrink-0"
        aria-hidden
      >
        <ellipse cx="50" cy="14" rx="8" ry="9" fill="var(--ink-faint)" />
        {ZONES.map((z) => {
          const isP = hit(z.aliases, primary);
          const isS = !isP && hit(z.aliases, secondary);
          return (
            <path
              key={z.id}
              d={z.d}
              fill={
                isP
                  ? "var(--muscle-hot)"
                  : isS
                    ? "var(--muscle-warm)"
                    : "var(--ink-faint)"
              }
              opacity={isP || isS ? 1 : 0.35}
            />
          );
        })}
      </svg>
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Cơ mục tiêu
        </p>
        <div className="flex flex-wrap gap-1">
          {primaryHits.length === 0 && labels.length === 0 && (
            <span className="text-xs text-[var(--muted)]">—</span>
          )}
          {primary.map((m) => (
            <span key={`p-${m}`} className="chip chip-hot">
              {m}
            </span>
          ))}
          {secondary.slice(0, 3).map((m) => (
            <span key={`s-${m}`} className="chip chip-soft">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
