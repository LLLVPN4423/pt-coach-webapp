import type { MealItem } from "@/lib/types";

export function MealCard({ meal }: { meal: MealItem }) {
  return (
    <article className="card !p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-2xl"
          aria-hidden
        >
          {meal.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">{meal.name}</h3>
            {meal.approxKcal != null && (
              <span className="text-sm text-[var(--muted)]">
                ~{meal.approxKcal} kcal
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--ink)]">
            {meal.items.join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {meal.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
            {meal.allergens.map((a) => (
              <span
                key={a}
                className="chip !bg-[#fde8e4] !text-[var(--danger)]"
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
