"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@/components/icons";
import { MealCard } from "@/components/MealCard";
import { MedicalBanner } from "@/components/MedicalBanner";
import { PageGate } from "@/components/PageGate";
import { WeekWorkout } from "@/components/WeekWorkout";
import { usePtStore } from "@/hooks/usePtStore";
import { weekdayIndex } from "@/lib/calc";
import { resolveEquipmentProfile } from "@/lib/exercise-select";
import { planNeedsRegen } from "@/lib/storage";
import { GOAL_LABELS } from "@/lib/types";
import { TRAINING_STYLE_LABELS } from "@/lib/training-styles";

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
  const eqProfile = resolveEquipmentProfile(profile);
  const allowedEquipment = eqProfile.strict ? eqProfile.allowed : undefined;

  const sch = plan.schedule;
  const goalLabel = GOAL_LABELS[sch?.goal ?? profile.goal] ?? profile.goal;
  const styleKey = sch?.trainingStyle || profile.trainingStyle || "balanced";
  const styleLabel = TRAINING_STYLE_LABELS[styleKey] ?? styleKey;
  const trainDays = plan.workoutDays.filter((d) => !d.isRest).length;
  const restDays = plan.workoutDays.filter((d) => d.isRest).length;

  return (
    <div className="space-y-6 rise">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="chip">Plan v{plan.version}</p>
          <h1 className="page-title mt-2">Lộ trình</h1>
          <p className="page-sub">{plan.rationale}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={regeneratePlan}>
          <IconRefresh size={16} /> Sinh lại
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="stat-tile rise-delay-1 sm:col-span-2">
          <p className="label">Phong cách</p>
          <p className="value text-[1.05rem] leading-snug">{styleLabel}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Mục tiêu: {goalLabel}
            {(sch?.goalNote || profile.goalNote)
              ? ` — ${sch?.goalNote || profile.goalNote}`
              : ""}
          </p>
        </div>
        <div className="stat-tile rise-delay-1">
          <p className="label">Tập / nghỉ</p>
          <p className="value">
            {trainDays}
            <span className="text-base font-medium text-[var(--muted)]">
              {" "}
              / {restDays}
            </span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">xen đều trong tuần</p>
        </div>
        <div className="stat-tile rise-delay-2">
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
        <p className="banner-warn px-3 py-2 text-xs">
          Plan cũ — cần chọn bài theo nơi tập/thiết bị + BMI —{" "}
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
          <h2 className="section-title text-base">Vì sao plan thế này</h2>
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
          <h2 className="section-title text-base">Lưu ý y tế gắn với plan</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {(plan.nutrition.medicalNotes ?? []).map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title text-xl">Dinh dưỡng</h2>
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

      <WeekWorkout
        days={plan.workoutDays}
        todayIdx={todayIdx}
        onSwap={swapExercise}
        avoidJoints={avoidJoints}
        lowImpact={lowImpact}
        allowedEquipment={allowedEquipment}
      />
    </div>
  );
}
