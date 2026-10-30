"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@/components/icons";
import { ExerciseCard } from "@/components/ExerciseCard";
import { MealCard } from "@/components/MealCard";
import { MedicalBanner } from "@/components/MedicalBanner";
import { PageGate } from "@/components/PageGate";
import { usePtStore } from "@/hooks/usePtStore";
import { weekdayIndex } from "@/lib/calc";

export default function PlanPage() {
  const router = useRouter();
  const { hydrated, profile, plan, regeneratePlan, swapExercise } = usePtStore();
  const todayIdx = weekdayIndex();

  useEffect(() => {
    if (hydrated && (!profile || !plan)) router.replace("/onboarding");
  }, [hydrated, profile, plan, router]);

  if (!hydrated || !plan || !profile) {
    return <PageGate ready={false} />;
  }

  const avoidJoints = profile.medical?.jointZones;
  const lowImpact =
    (profile.medical?.jointZones?.length ?? 0) > 0 ||
    (profile.medical?.conditions ?? []).includes("herniated_disc") ||
    (profile.medical?.conditions ?? []).includes("pregnancy") ||
    !!profile.medical?.hasRedFlags;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="chip">v{plan.version}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
            Lộ trình
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{plan.rationale}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={regeneratePlan}>
          <IconRefresh size={16} /> Sinh lại
        </button>
      </div>

      <p className="rounded-xl border border-[var(--line)] bg-[var(--sand)] px-3 py-2 text-xs text-[var(--muted)]">
        Plan cũ trong trình duyệt có thể thiếu meal/macro mới — bấm{" "}
        <button
          type="button"
          className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          onClick={regeneratePlan}
        >
          Sinh lại
        </button>{" "}
        để lấy catalog free-exercise-db + foods.
      </p>

      <MedicalBanner profile={profile} />

      {(plan.nutrition.medicalNotes?.length ?? 0) > 0 && (
        <section className="card space-y-2">
          <h2 className="font-semibold">Lưu ý y tế gắn với plan</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {(plan.nutrition.medicalNotes ?? []).map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Meal plan</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Calo", `${plan.nutrition.dailyCalories}`],
            ["Protein", `${plan.nutrition.proteinG}g`],
            ["Carb", `${plan.nutrition.carbsG}g`],
            ["Fat", `${plan.nutrition.fatG}g`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[var(--sand)] p-3 sm:col-span-1">
              <p className="text-xs text-[var(--muted)]">{k}</p>
              <p className="text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3">
          {plan.nutrition.meals.map((m) => (
            <MealCard key={m.name} meal={m} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tuần tập · ảnh + clip hướng dẫn</h2>
        <p className="text-sm text-[var(--muted)]">
          Ảnh minh họa từ free-exercise-db · clip qua YouTube form tutorial (mở
          tab mới). Pattern giống Nike Training Club / Hevy.
        </p>
        <div className="grid gap-4">
          {plan.workoutDays.map((d) => (
            <article
              key={d.dayIndex}
              className={`card space-y-3 ${
                d.dayIndex === todayIdx ? "ring-2 ring-[var(--accent)]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {d.dayName}
                    {d.dayIndex === todayIdx ? " · hôm nay" : ""}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{d.focus}</p>
                </div>
                {d.isRest && <span className="chip">Rest</span>}
              </div>
              <div className="space-y-2">
                {d.exercises.map((e) => (
                  <ExerciseCard
                    key={`${d.dayIndex}-${e.id}`}
                    exercise={e}
                    dayIndex={d.dayIndex}
                    onSwap={swapExercise}
                    avoidJoints={avoidJoints}
                    lowImpact={lowImpact}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
