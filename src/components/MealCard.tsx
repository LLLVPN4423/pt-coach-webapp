import type { MealItem } from "@/lib/types";

export function MealCard({ meal }: { meal: MealItem }) {
  return (
    <article className="card !p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--elevated)] text-2xl ring-1 ring-[var(--line)]"
          aria-hidden
        >
          {meal.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold">{meal.name}</h3>
            {meal.approxKcal != null && (
              <span className="rounded-full bg-[var(--sand)] px-2.5 py-0.5 text-sm font-semibold tabular-nums">
                ~{meal.approxKcal} kcal
              </span>
            )}
          </div>
          <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]">
            {meal.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="text-[var(--accent)]">▸</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-1">
            {meal.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
            {meal.allergens.map((a) => (
              <span
                key={a}
                className="chip chip-hot"
              >
                dị ứng: {a}
              </span>
            ))}
          </div>
          {meal.swaps.length > 0 && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Đổi món: </span>
              {meal.swaps.join(" · ")}
            </p>
          )}
          {meal.tip && (
            <p className="mt-1 text-xs text-[var(--accent)]">{meal.tip}</p>
          )}
        </div>
      </div>
    </article>
  );
}
