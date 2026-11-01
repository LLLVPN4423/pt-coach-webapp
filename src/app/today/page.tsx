"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  CONTEXT_DAY_TAGS,
  FEMALE_SYMPTOM_LABELS,
  estimateCycleDay,
  shouldDeloadToday,
} from "@/lib/context";
import {
  exerciseLogKey,
  getExerciseProgress,
  mealCompletion,
  toggleSetInProgress,
  workoutCompletion,
} from "@/lib/log-progress";
import { planNeedsRegen } from "@/lib/storage";
import { weekWorkoutCount, weeklyScore } from "@/lib/progress";
import type { ExerciseSet } from "@/lib/types";

export default function TodayPage() {
  const router = useRouter();
  const {
    hydrated,
    profile,
    plan,
    todayLog,
    updateLog,
    swapExercise,
    regeneratePlan,
    logs,
  } = usePtStore();
  const day = plan?.workoutDays[weekdayIndex()];
  const [deloadOverride, setDeloadOverride] = useState(false);

  useEffect(() => {
    if (hydrated && (!profile || !plan)) router.replace("/onboarding");
  }, [hydrated, profile, plan, router]);

  const deload = useMemo(() => {
    if (deloadOverride || todayLog?.wantsDeloadToday) return true;
    return shouldDeloadToday({
      contextTags: todayLog?.contextTags,
      wantsDeload: todayLog?.wantsDeloadToday,
      sleepHours: todayLog?.sleepHours,
      energy1to5: todayLog?.energy1to5,
      soreness1to5: todayLog?.soreness1to5,
      stress1to5: todayLog?.stress1to5,
      bleeding: todayLog?.bleeding,
      symptoms: todayLog?.symptoms,
    });
  }, [todayLog, deloadOverride]);

  if (!hydrated || !profile || !plan || !day) {
    return <PageGate ready={false} />;
  }

  const avoidJoints = profile.medical?.jointZones;
  const lowImpact =
    deload ||
    (profile.medical?.jointZones?.length ?? 0) > 0 ||
    (profile.medical?.conditions ?? []).includes("herniated_disc") ||
    (profile.medical?.conditions ?? []).includes("pregnancy") ||
    !!profile.medical?.hasRedFlags;

  const water = todayLog?.waterGlasses ?? 0;
  const waterGoal = Math.round(plan.nutrition.waterL * 4);
  const needsRegen = planNeedsRegen(plan);
  const score = weeklyScore(logs, plan);
  const weekDone = weekWorkoutCount(logs);
  const wc = workoutCompletion(day.exercises, todayLog, deload);
  const mc = mealCompletion(plan.nutrition.meals, todayLog);
  const cycleDay =
    profile.sex === "female" && profile.femaleCycle?.cycleTrackingEnabled
      ? estimateCycleDay(
          profile.femaleCycle.lastPeriodStart,
          profile.femaleCycle.avgCycleLength,
        )
      : null;

  function toggleTag(id: string) {
    const cur = todayLog?.contextTags ?? [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    updateLog({ contextTags: next });
  }

  function toggleSymptom(id: string) {
    const cur = todayLog?.symptoms ?? [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    updateLog({ symptoms: next });
  }

  function setCountFor(ex: ExerciseSet) {
    return deload ? Math.max(1, ex.sets - 1) : ex.sets;
  }

  function toggleExerciseSet(ex: ExerciseSet, setIndex: number) {
    const n = setCountFor(ex);
    const key = exerciseLogKey(ex);
    const cur = getExerciseProgress(todayLog, ex, n);
    const nextProg = toggleSetInProgress(cur, setIndex);
    const exerciseProgress = {
      ...(todayLog?.exerciseProgress || {}),
      [key]: nextProg,
    };
    const probe = { ...todayLog, exerciseProgress, date: todayLog?.date || "" };
    const nextWc = workoutCompletion(day!.exercises, probe, deload);
    updateLog({
      exerciseProgress,
      workoutDone: !deload && nextWc.allDone,
      workoutAdjusted: deload && nextWc.allDone,
    });
  }

  function toggleMeal(name: string) {
    const mealProgress = {
      ...(todayLog?.mealProgress || {}),
      [name]: !todayLog?.mealProgress?.[name],
    };
    const probe = { ...todayLog, mealProgress, date: todayLog?.date || "" };
    const nextMc = mealCompletion(plan!.nutrition.meals, probe);
    updateLog({
      mealProgress,
      nutritionOnTrack: nextMc.allDone,
    });
  }

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="text-sm text-[var(--muted)]">Xin chào, {profile.name}</p>
        <h1 className="page-title">Hôm nay</h1>
        <p className="page-sub">
          Điểm tuần {score} · {weekDone}/{plan.schedule?.daysPerWeek ?? profile.daysPerWeek}{" "}
          buổi ·{" "}
          {plan.schedule
            ? `${plan.schedule.sessionsPerDay}×${plan.schedule.sessionMinutes}p`
            : day.focus}
        </p>
      </div>

      {needsRegen && (
        <div className="banner-warn px-3 py-2 text-sm">
          Plan cần cập nhật (volume theo BMI, RX hiệp/nghỉ) —{" "}
          <button
            type="button"
            className="font-semibold text-[var(--accent)] underline"
            onClick={regeneratePlan}
          >
            Sinh lại plan
          </button>{" "}
          để có số hiệp/rep/nghỉ phù hợp thể trạng.
        </div>
      )}

      <MedicalBanner profile={profile} />

      <section className="card space-y-3">
        <h2 className="section-title text-base">Hoàn cảnh hôm nay</h2>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_DAY_TAGS.map((t) => {
            const on = todayLog?.contextTags?.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="field">
            <label>Ngủ (giờ)</label>
            <input
              type="number"
              step="0.5"
              min={0}
              max={14}
              value={todayLog?.sleepHours ?? ""}
              onChange={(e) =>
                updateLog({
                  sleepHours:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Năng lượng 1–5</label>
            <input
              type="number"
              min={1}
              max={5}
              value={todayLog?.energy1to5 ?? ""}
              onChange={(e) =>
                updateLog({
                  energy1to5:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>Đau cơ 1–5</label>
            <input
              type="number"
              min={1}
              max={5}
              value={todayLog?.soreness1to5 ?? ""}
              onChange={(e) =>
                updateLog({
                  soreness1to5:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="field">
            <label>RPE 1–10</label>
            <input
              type="number"
              min={1}
              max={10}
              value={todayLog?.rpe ?? ""}
              onChange={(e) =>
                updateLog({
                  rpe:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {profile.sex === "female" &&
          profile.femaleCycle?.cycleTrackingEnabled && (
            <div className="space-y-2 rounded-xl bg-[var(--sand)] p-3">
              <p className="text-xs font-semibold">
                Chu kỳ{" "}
                {cycleDay != null ? `· ~ngày ${cycleDay}` : ""} (tham khảo)
              </p>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!todayLog?.bleeding}
                  onChange={(e) => updateLog({ bleeding: e.target.checked })}
                />
                Đang hành kinh
              </label>
              <div className="flex flex-wrap gap-1">
                {Object.entries(FEMALE_SYMPTOM_LABELS).map(([id, label]) => {
                  const on = todayLog?.symptoms?.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleSymptom(id)}
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-[var(--elevated)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {profile.sex === "male" &&
          profile.maleReadiness?.readinessTrackingEnabled && (
            <div className="field max-w-xs">
              <label>Stress 1–5</label>
              <input
                type="number"
                min={1}
                max={5}
                value={todayLog?.stress1to5 ?? ""}
                onChange={(e) =>
                  updateLog({
                    stress1to5:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
            </div>
          )}

        {(deload || deloadOverride) && (
          <div className="banner-warn px-3 py-2 text-xs">
            <strong>Chế độ nhẹ hôm nay</strong> — giảm set, ưu tiên low-impact.
            Deload vẫn được tính tiến độ một phần.
            <button
              type="button"
              className="ml-2 font-semibold text-[var(--accent)]"
              onClick={() => {
                setDeloadOverride(false);
                updateLog({ wantsDeloadToday: false });
              }}
            >
              Tắt
            </button>
          </div>
        )}
        {!deload && (
          <button
            type="button"
            className="btn btn-ghost text-xs"
            onClick={() => {
              setDeloadOverride(true);
              updateLog({ wantsDeloadToday: true });
            }}
          >
            Bật deload hôm nay
          </button>
        )}
      </section>

      <section className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="chip">{day.isRest ? "Nghỉ / nhẹ" : "Tập"}</p>
            <h2 className="section-title mt-2 text-xl">{day.dayName}</h2>
            <p className="text-[var(--muted)]">{day.focus}</p>
            {!day.isRest && (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Tiến độ{" "}
                <span className="font-semibold text-[var(--text)]">
                  {wc.setsDone}/{wc.setsTotal}
                </span>{" "}
                hiệp · {wc.done}/{wc.total} bài
              </p>
            )}
          </div>
          <button
            type="button"
            className={`btn ${todayLog?.workoutDone || todayLog?.workoutAdjusted ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              const markOn = !(
                todayLog?.workoutDone || todayLog?.workoutAdjusted
              );
              if (!markOn) {
                updateLog({
                  workoutDone: false,
                  workoutAdjusted: false,
                  exerciseProgress: {},
                });
                return;
              }
              // Đánh dấu nhanh: tick hết mọi hiệp
              const exerciseProgress: Record<
                string,
                { setsDone: boolean[] }
              > = {};
              for (const ex of day.exercises) {
                const n = setCountFor(ex);
                exerciseProgress[exerciseLogKey(ex)] = {
                  setsDone: Array.from({ length: n }, () => true),
                };
              }
              updateLog({
                exerciseProgress,
                workoutDone: !deload,
                workoutAdjusted: !!deload,
              });
            }}
          >
            <IconCheck size={16} />
            {todayLog?.workoutDone
              ? "Đã tập"
              : todayLog?.workoutAdjusted
                ? "Đã làm bản nhẹ"
                : "Tick hết"}
          </button>
        </div>
        <div className="space-y-2">
          {day.exercises.map((ex) => {
            const n = setCountFor(ex);
            const prog = getExerciseProgress(todayLog, ex, n);
            return (
              <ExerciseCard
                key={`${ex.sessionBlock ?? 1}-${ex.id}-${ex.name}`}
                exercise={ex}
                compact
                dayIndex={day.dayIndex}
                onSwap={swapExercise}
                avoidJoints={avoidJoints}
                lowImpact={lowImpact}
                deload={deload}
                setsDone={prog.setsDone}
                onToggleSet={(i) => toggleExerciseSet(ex, i)}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
          >
            <IconDumbbell size={14} /> Lộ trình tuần
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
          >
            Tiến độ / biểu đồ
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
          >
            <IconUtensils size={14} /> Thư viện
          </Link>
        </div>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <IconUtensils size={18} className="text-[var(--accent)]" />
              Dinh dưỡng hôm nay
            </div>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
              {plan.nutrition.dailyCalories}{" "}
              <span className="text-base font-normal tracking-normal text-[var(--muted)]">
                kcal
              </span>
            </p>
            <p className="text-xs text-[var(--muted)]">
              P {plan.nutrition.proteinG}g · C {plan.nutrition.carbsG}g · F{" "}
              {plan.nutrition.fatG}g · tick từng bữa
            </p>
          </div>
          <p className="chip">
            {mc.done}/{mc.total} bữa
          </p>
        </div>
        <div className="space-y-2">
          {plan.nutrition.meals.map((meal) => {
            const on = !!todayLog?.mealProgress?.[meal.name];
            return (
              <button
                key={meal.name}
                type="button"
                onClick={() => toggleMeal(meal.name)}
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] bg-[var(--elevated)]"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {meal.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-display font-semibold">
                      {meal.name}
                    </span>
                    {meal.approxKcal != null && (
                      <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
                        ~{meal.approxKcal} kcal
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">
                    {meal.items.slice(0, 2).join(" · ")}
                    {meal.items.length > 2 ? "…" : ""}
                  </span>
                </span>
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                      : "border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <IconDroplets size={16} className="text-[var(--accent)]" />
              Nước · ~{plan.nutrition.waterL}L
            </div>
            <p className="font-display text-xl font-semibold tabular-nums">
              {water}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">
                / {waterGoal} ly
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                updateLog({ waterGlasses: Math.max(0, water - 1) })
              }
            >
              −1
            </button>
            <button
              type="button"
              className="btn btn-primary"
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
