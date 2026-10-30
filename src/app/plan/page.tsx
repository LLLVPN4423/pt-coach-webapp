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
import { planNeedsRegen } from "@/lib/storage";
import { GOAL_LABELS } from "@/lib/types";

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

  const sch = plan.schedule;
  const goalLabel = GOAL_LABELS[sch?.goal ?? profile.goal] ?? profile.goal;

  return (
    <div className="space-y-6 rise">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="chip">Plan v{plan.version}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Lộ trình
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{plan.rationale}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={regeneratePlan}>
          <IconRefresh size={16} /> Sinh lại
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-tile rise-delay-1">
          <p className="label">Mục tiêu</p>
          <p className="value text-[1.05rem] leading-snug">{goalLabel}</p>
          {(sch?.goalNote || profile.goalNote) && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {sch?.goalNote || profile.goalNote}
            </p>
          )}
        </div>
        <div className="stat-tile rise-delay-1">
          <p className="label">Ngày / tuần</p>
          <p className="value">
            {sch?.daysPerWeek ?? profile.daysPerWeek}
            <span className="text-base font-medium text-[var(--muted)]"> ngày</span>
          </p>
        </div>
        <div className="stat-tile rise-delay-2">
          <p className="label">Buổi / ngày tập</p>
          <p className="value">
            {sch?.sessionsPerDay ?? profile.sessionsPerDay ?? 1}
            <span className="text-base font-medium text-[var(--muted)]"> buổi</span>
          </p>
        </div>
        <div className="stat-tile rise-delay-3">
          <p className="label">Thời lượng / buổi</p>
          <p className="value">
            {sch?.sessionMinutes ?? profile.sessionMinutes ?? 45}
            <span className="text-base font-medium text-[var(--muted)]"> phút</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            ≈ {sch?.weeklyMinutes ?? "—"} phút / tuần
          </p>
        </div>
      </section>

      {planNeedsRegen(plan) && (
        <p className="rounded-2xl border border-[var(--warn)]/40 bg-[#fff6e8] px-3 py-2 text-xs">
          Plan chưa có 3D GIF / hoàn cảnh mới —{" "}
          <button
            type="button"
            className="font-semibold text-[var(--accent)] underline"
            onClick={regeneratePlan}
          >
            Sinh lại ngay
          </button>
        </p>
      )}

      {((plan.contextNotes?.length ?? 0) + (plan.sexNotes?.length ?? 0)) > 0 && (
        <section className="card space-y-2 text-sm">
          <h2 className="font-semibold">Vì sao plan thế này</h2>
          <ul className="list-disc space-y-1 pl-5 text-[var(--muted)]">
            {[...(plan.sexNotes || []), ...(plan.contextNotes || [])].map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

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
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Dinh dưỡng
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["Calo", `${plan.nutrition.dailyCalories}`],
            ["Protein", `${plan.nutrition.proteinG}g`],
            ["Carb", `${plan.nutrition.carbsG}g`],
            ["Fat", `${plan.nutrition.fatG}g`],
          ].map(([k, v]) => (
            <div key={k} className="stat-tile">
              <p className="label">{k}</p>
              <p className="value">{v}</p>
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
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Tuần tập
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Bấm ảnh / “Xem hướng dẫn video” để mở clip YouTube form · sơ đồ cơ
          đánh dấu nhóm chính (đỏ) / phụ.
        </p>
        <div className="grid gap-4">
          {plan.workoutDays.map((d) => (
            <article
              key={d.dayIndex}
              className={`card space-y-3 ${
                d.dayIndex === todayIdx
                  ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold tracking-tight">
                    {d.dayName}
                    {d.dayIndex === todayIdx ? " · hôm nay" : ""}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{d.focus}</p>
                </div>
                {d.isRest && <span className="chip">Rest</span>}
              </div>
              <div className="space-y-2.5">
                {d.exercises.map((e) => (
                  <ExerciseCard
                    key={`${d.dayIndex}-${e.id}-${e.sessionBlock ?? 0}`}
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
