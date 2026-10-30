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
import { planNeedsRegen } from "@/lib/storage";
import { weekWorkoutCount, weeklyScore } from "@/lib/progress";

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

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="text-sm text-[var(--muted)]">Xin chào, {profile.name}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          Hôm nay
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Điểm tuần {score} · {weekDone}/{plan.schedule?.daysPerWeek ?? profile.daysPerWeek}{" "}
          buổi ·{" "}
          {plan.schedule
            ? `${plan.schedule.sessionsPerDay}×${plan.schedule.sessionMinutes}p`
            : day.focus}
        </p>
      </div>

      {needsRegen && (
        <div className="rounded-2xl border border-[var(--warn)]/40 bg-[#fff6e8] px-3 py-2 text-sm">
          Catalog 3D GIF mới —{" "}
          <button
            type="button"
            className="font-semibold text-[var(--accent)] underline"
            onClick={regeneratePlan}
          >
            Sinh lại plan
          </button>{" "}
          để có animation + hoàn cảnh.
        </div>
      )}

      <MedicalBanner profile={profile} />

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold">Hoàn cảnh hôm nay</h2>
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
                          : "border-[var(--line)] bg-white"
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
          <div className="rounded-xl border border-[var(--warn)]/30 bg-[#fff6e8] px-3 py-2 text-xs">
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
            <h2 className="mt-2 text-xl font-semibold">{day.dayName}</h2>
            <p className="text-[var(--muted)]">{day.focus}</p>
          </div>
          <button
            type="button"
            className={`btn ${todayLog?.workoutDone || todayLog?.workoutAdjusted ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              if (deload) {
                updateLog({
                  workoutAdjusted: !todayLog?.workoutAdjusted,
                  workoutDone: false,
                });
              } else {
                updateLog({
                  workoutDone: !todayLog?.workoutDone,
                  workoutAdjusted: false,
                });
              }
            }}
          >
            <IconCheck size={16} />
            {todayLog?.workoutDone
              ? "Đã tập"
              : todayLog?.workoutAdjusted
                ? "Đã làm bản nhẹ"
                : deload
                  ? "Xong bản nhẹ"
                  : "Đánh dấu xong"}
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
              deload={deload}
            />
          ))}
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

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <IconUtensils size={18} className="text-[var(--accent)]" />
            Dinh dưỡng
          </div>
          <p className="text-2xl font-semibold">
            {plan.nutrition.dailyCalories}{" "}
            <span className="text-base font-normal text-[var(--muted)]">
              kcal
            </span>
          </p>
          <button
            type="button"
            className={`btn w-full ${todayLog?.nutritionOnTrack ? "btn-primary" : "btn-ghost"}`}
            onClick={() =>
              updateLog({ nutritionOnTrack: !todayLog?.nutritionOnTrack })
            }
          >
            {todayLog?.nutritionOnTrack ? "Đã ăn theo plan" : "Đánh dấu ăn đúng"}
          </button>
        </div>
        <div className="card space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <IconDroplets size={18} className="text-[var(--accent)]" />
            Nước · ~{plan.nutrition.waterL}L
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
