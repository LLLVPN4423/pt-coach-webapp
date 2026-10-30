"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconDroplets,
  IconDumbbell,
  IconUtensils,
} from "@/components/icons";
import { ExerciseCard } from "@/components/ExerciseCard";
import { MedicalBanner } from "@/components/MedicalBanner";
import { PageGate } from "@/components/PageGate";
import { usePtStore } from "@/hooks/usePtStore";
import { weekdayIndex } from "@/lib/calc";

export default function TodayPage() {
  const router = useRouter();
  const { hydrated, profile, plan, todayLog, updateLog, swapExercise } =
    usePtStore();
  const day = plan?.workoutDays[weekdayIndex()];
  const avoidJoints = profile?.medical?.jointZones;
  const lowImpact =
    !!profile &&
    ((profile.medical?.jointZones?.length ?? 0) > 0 ||
      (profile.medical?.conditions ?? []).includes("herniated_disc") ||
      (profile.medical?.conditions ?? []).includes("pregnancy") ||
      !!profile.medical?.hasRedFlags);

  useEffect(() => {
    if (hydrated && (!profile || !plan)) router.replace("/onboarding");
  }, [hydrated, profile, plan, router]);

  if (!hydrated || !profile || !plan || !day) {
    return <PageGate ready={false} />;
  }

  const water = todayLog?.waterGlasses ?? 0;
  const waterGoal = Math.round(plan.nutrition.waterL * 4);

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="text-sm text-[var(--muted)]">Xin chào, {profile.name}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)]">
          Hôm nay
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {plan.schedule
            ? `${plan.schedule.daysPerWeek} ngày/tuần · ${plan.schedule.sessionsPerDay} buổi × ${plan.schedule.sessionMinutes}p`
            : day.focus}
        </p>
      </div>

      <MedicalBanner profile={profile} />

      <section className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="chip">{day.isRest ? "Nghỉ / nhẹ" : "Tập"}</p>
            <h2 className="mt-2 text-xl font-semibold">{day.dayName}</h2>
            <p className="text-[var(--muted)]">{day.focus}</p>
          </div>
          <button
            type="button"
            className={`btn ${todayLog?.workoutDone ? "btn-primary" : "btn-ghost"}`}
            onClick={() => updateLog({ workoutDone: !todayLog?.workoutDone })}
          >
            <IconCheck size={16} />
            {todayLog?.workoutDone ? "Đã tập" : "Đánh dấu xong"}
          </button>
        </div>
        <div className="space-y-2">
          {day.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id + ex.name}
              exercise={ex}
              compact
              dayIndex={day.dayIndex}
              onSwap={swapExercise}
              avoidJoints={avoidJoints}
              lowImpact={lowImpact}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
          >
            <IconDumbbell size={14} /> Xem cả tuần + meal plan
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
          >
            <IconUtensils size={14} /> Thư viện bài tập / thực phẩm
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <IconUtensils size={18} className="text-[var(--accent)]" />
            Dinh dưỡng hôm nay
          </div>
          <p className="text-2xl font-semibold">
            {plan.nutrition.dailyCalories}{" "}
            <span className="text-base font-normal text-[var(--muted)]">
              kcal
            </span>
          </p>
          <p className="text-sm text-[var(--muted)]">
            P {plan.nutrition.proteinG}g · C {plan.nutrition.carbsG}g · F{" "}
            {plan.nutrition.fatG}g
          </p>
          <ul className="space-y-1 text-sm">
            {plan.nutrition.meals.map((m) => (
              <li key={m.name}>
                {m.emoji} {m.name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`btn w-full ${todayLog?.nutritionOnTrack ? "btn-primary" : "btn-ghost"}`}
            onClick={() =>
              updateLog({ nutritionOnTrack: !todayLog?.nutritionOnTrack })
            }
          >
            {todayLog?.nutritionOnTrack
              ? "Đã ăn theo plan"
              : "Đánh dấu ăn đúng plan"}
          </button>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <IconDroplets size={18} className="text-[var(--accent)]" />
            Nước · mục tiêu ~{plan.nutrition.waterL}L
          </div>
          <p className="text-2xl font-semibold">
            {water}{" "}
            <span className="text-base font-normal text-[var(--muted)]">
              / {waterGoal} ly
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost flex-1"
              onClick={() =>
                updateLog({ waterGlasses: Math.max(0, water - 1) })
              }
            >
              −1
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => updateLog({ waterGlasses: water + 1 })}
            >
              +1 ly
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
