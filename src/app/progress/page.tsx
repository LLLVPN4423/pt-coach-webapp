"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarRow, DayDots, Sparkline } from "@/components/charts";
import { PageGate } from "@/components/PageGate";
import { usePtStore } from "@/hooks/usePtStore";
import {
  adherenceSeries,
  streakWorkout,
  weekWorkoutCount,
  weeklyScore,
  weightSeries,
} from "@/lib/progress";

export default function ProgressPage() {
  const router = useRouter();
  const { hydrated, profile, plan, logs, weightLog } = usePtStore();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  const series14 = useMemo(() => adherenceSeries(logs, 14), [logs]);
  const series28 = useMemo(() => adherenceSeries(logs, 28), [logs]);
  const score = weeklyScore(logs, plan);
  const streak = streakWorkout(logs);
  const weekDone = weekWorkoutCount(logs);
  const target = plan?.schedule.daysPerWeek ?? 3;
  const weights = weightSeries(weightLog, 28);

  if (!hydrated || !profile) return <PageGate ready={false} />;

  const workoutPct =
    series14.reduce((a, s) => a + s.workout, 0) / Math.max(series14.length, 1);
  const nutrPct =
    series14.reduce((a, s) => a + s.nutrition, 0) / Math.max(series14.length, 1);
  const waterAvg =
    series14.reduce((a, s) => a + s.water, 0) / Math.max(series14.length, 1);
  const waterGoal = Math.round((plan?.nutrition.waterL ?? 3) * 4);

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="chip">Đánh giá lộ trình</p>
        <h1 className="page-title mt-2">Tiến độ</h1>
        <p className="page-sub">
          Điểm tuần từ check-in tập / ăn / nước (deload vẫn được tính một phần).
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="stat-tile">
          <p className="label">Điểm tuần</p>
          <p className="value">{score}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Streak tập</p>
          <p className="value">
            {streak}
            <span className="text-base text-[var(--muted)]"> ngày</span>
          </p>
        </div>
        <div className="stat-tile">
          <p className="label">Tuần này</p>
          <p className="value">
            {weekDone}/{target}
            <span className="text-base text-[var(--muted)]"> buổi</span>
          </p>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">14 ngày gần đây</h2>
        <DayDots
          series={series14.map((s) => {
            const l = logs.find((x) => x.date.slice(0, 10) === s.date);
            return {
              date: s.date,
              on: s.workout === 1,
              soft: !!l?.workoutAdjusted && !l?.workoutDone,
            };
          })}
        />
        <BarRow label="Tuân thủ tập" value={workoutPct} max={1} />
        <BarRow label="Ăn đúng plan" value={nutrPct} max={1} />
        <BarRow
          label={`Nước TB (mục tiêu ${waterGoal} ly)`}
          value={waterAvg}
          max={waterGoal}
        />
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">RPE (28 ngày)</h2>
        <Sparkline values={series28.map((s) => s.rpe)} />
      </section>

      <section className="card space-y-2">
        <h2 className="section-title">Cân nặng</h2>
        <Sparkline values={weights.map((w) => w.weightKg)} />
        {weights.length > 0 && (
          <p className="text-xs text-[var(--muted)]">
            Gần nhất: {weights[weights.length - 1].weightKg} kg
            {weights[weights.length - 1].bodyFatPct != null
              ? ` · ${weights[weights.length - 1].bodyFatPct}% mỡ`
              : ""}
          </p>
        )}
      </section>

      {(plan?.contextNotes?.length || plan?.sexNotes?.length) && (
        <section className="card space-y-2 text-sm text-[var(--muted)]">
          <h2 className="section-title">Gợi ý gắn plan</h2>
          <ul className="list-disc space-y-1 pl-5">
            {[...(plan?.sexNotes || []), ...(plan?.contextNotes || [])]
              .slice(0, 6)
              .map((n) => (
                <li key={n}>{n}</li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
