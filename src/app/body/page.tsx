"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageGate } from "@/components/PageGate";
import { usePtStore } from "@/hooks/usePtStore";
import { bmi, bmrMifflin, tdeeFromBmr, todayKey } from "@/lib/calc";

export default function BodyPage() {
  const router = useRouter();
  const {
    hydrated,
    profile,
    latestMetrics,
    weightLog,
    setMetrics,
    addWeight,
  } = usePtStore();

  const [weightKg, setW] = useState(70);
  const [bodyFatPct, setBf] = useState<number | "">("");
  const [heightCm, setH] = useState(170);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  useEffect(() => {
    if (latestMetrics) {
      setW(latestMetrics.weightKg);
      setH(latestMetrics.heightCm);
      setBf(latestMetrics.bodyFatPct ?? "");
    }
  }, [latestMetrics]);

  const stats = useMemo(() => {
    if (!profile || !latestMetrics) return null;
    const b = bmrMifflin(
      latestMetrics.weightKg,
      latestMetrics.heightCm,
      profile.age,
      profile.sex,
    );
    return {
      bmi: bmi(latestMetrics.weightKg, latestMetrics.heightCm),
      bmr: b,
      tdee: tdeeFromBmr(b, profile.activity),
    };
  }, [profile, latestMetrics]);

  const chart = useMemo(() => {
    const points = [...weightLog].reverse().slice(-14);
    if (points.length === 0) return null;
    const weights = points.map((p) => p.weightKg);
    const min = Math.min(...weights) - 1;
    const max = Math.max(...weights) + 1;
    const w = 280;
    const h = 80;
    const path = points
      .map((p, i) => {
        const x = (i / Math.max(points.length - 1, 1)) * w;
        const y = h - ((p.weightKg - min) / (max - min || 1)) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return { path, w, h, last: points[points.length - 1]?.weightKg };
  }, [weightLog]);

  if (!hydrated || !profile) {
    return <PageGate ready={false} />;
  }

  function saveFull() {
    setMetrics({
      weightKg,
      heightCm,
      bodyFatPct: bodyFatPct === "" ? undefined : Number(bodyFatPct),
      skeletalMuscleKg: latestMetrics?.skeletalMuscleKg,
      measuredAt: new Date().toISOString(),
    });
  }

  function quickWeight() {
    addWeight({
      date: todayKey(),
      weightKg,
      bodyFatPct: bodyFatPct === "" ? undefined : Number(bodyFatPct),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Cơ thể
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Theo dõi cân / % mỡ · cập nhật InBody sẽ sinh lại lộ trình
        </p>
      </div>

      {stats && latestMetrics && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["BMI", stats.bmi],
            ["BMR", stats.bmr],
            ["TDEE", stats.tdee],
            ["Cân", `${latestMetrics.weightKg} kg`],
          ].map(([k, v]) => (
            <div key={k as string} className="card py-3">
              <p className="text-xs text-[var(--muted)]">{k}</p>
              <p className="text-xl font-semibold">{v}</p>
            </div>
          ))}
        </section>
      )}

      {chart && (
        <section className="card">
          <p className="mb-2 text-sm font-semibold">Xu hướng cân (gần đây)</p>
          <svg viewBox={`0 0 ${chart.w} ${chart.h}`} className="w-full">
            <path
              d={chart.path}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">Cập nhật số đo</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="field">
            <label>Cân (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setW(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Cao (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setH(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>% mỡ</label>
            <input
              type="number"
              step="0.1"
              value={bodyFatPct}
              onChange={(e) =>
                setBf(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={quickWeight}>
            Chỉ ghi cân hôm nay
          </button>
          <button type="button" className="btn btn-primary" onClick={saveFull}>
            Lưu InBody + sinh lại plan
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-2 font-semibold">Lịch sử cân</h2>
        <ul className="max-h-48 space-y-1 overflow-auto text-sm">
          {weightLog.length === 0 && (
            <li className="text-[var(--muted)]">Chưa có dữ liệu</li>
          )}
          {weightLog.map((w) => (
            <li key={w.date} className="flex justify-between border-b border-[var(--line)] py-1.5">
              <span>{w.date.slice(0, 10)}</span>
              <span>
                {w.weightKg} kg
                {w.bodyFatPct != null ? ` · ${w.bodyFatPct}%` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
