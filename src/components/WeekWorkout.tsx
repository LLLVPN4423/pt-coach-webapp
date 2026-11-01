"use client";

import { useMemo, useState } from "react";
import type { ExerciseSet, WorkoutDay } from "@/lib/types";
import { ExerciseCard } from "@/components/ExerciseCard";

function groupBySession(exercises: ExerciseSet[]) {
  const map = new Map<number, ExerciseSet[]>();
  for (const e of exercises) {
    const key = e.sessionBlock ?? 1;
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  return [...map.entries()].sort(([a], [b]) => a - b);
}

/** Mon=0 … Sun=6 — khớp weekdayIndex / plan-generator */
const SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function WeekWorkout({
  days,
  todayIdx,
  onSwap,
  avoidJoints,
  lowImpact,
  allowedEquipment,
}: {
  days: WorkoutDay[];
  todayIdx: number;
  onSwap: (dayIndex: number, oldId: string, next: ExerciseSet) => void;
  avoidJoints?: string[];
  lowImpact?: boolean;
  allowedEquipment?: string[];
}) {
  const [dayIdx, setDayIdx] = useState(todayIdx);
  const day = days[dayIdx] ?? days[0];
  const sessions = useMemo(
    () => (day ? groupBySession(day.exercises) : []),
    [day],
  );
  const multiSession = sessions.length > 1;

  if (!day) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="section-title text-xl">Tuần tập</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Chọn ngày · bấm ảnh để xem GIF 3D · mở Chi tiết để xem sơ đồ cơ
            (chính đỏ / phụ).
          </p>
        </div>
      </div>

      <div
        className="week-day-tabs"
        role="tablist"
        aria-label="Ngày trong tuần"
      >
        {days.map((d) => {
          const active = d.dayIndex === dayIdx;
          const isToday = d.dayIndex === todayIdx;
          return (
            <button
              key={d.dayIndex}
              type="button"
              role="tab"
              aria-selected={active}
              className={`week-day-tab ${active ? "is-active" : ""} ${
                d.isRest ? "is-rest" : ""
              }`}
              onClick={() => setDayIdx(d.dayIndex)}
            >
              <span className="week-day-tab__short">
                {SHORT[d.dayIndex] ?? d.dayName.slice(0, 2)}
              </span>
              <span className="week-day-tab__name">{d.dayName}</span>
              {isToday && <span className="week-day-tab__dot" aria-hidden />}
              {d.isRest && (
                <span className="week-day-tab__rest">Nghỉ</span>
              )}
            </button>
          );
        })}
      </div>

      <article
        className={`card space-y-4 ${
          day.dayIndex === todayIdx
            ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
            : ""
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {day.dayName}
              {day.dayIndex === todayIdx ? " · hôm nay" : ""}
            </p>
            <p className="text-sm text-[var(--muted)]">{day.focus}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {day.isRest && <span className="chip">Rest</span>}
            {!day.isRest && (
              <span className="chip chip-soft">
                {day.exercises.length} bài
                {multiSession ? ` · ${sessions.length} buổi` : ""}
              </span>
            )}
          </div>
        </div>

        {day.isRest && day.exercises.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Ngày nghỉ — đi bộ nhẹ / mobility nếu muốn.
          </p>
        ) : (
          <div className="space-y-5">
            {sessions.map(([block, list]) => (
              <div key={block} className="space-y-2">
                {multiSession && (
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                      Buổi {block}
                    </p>
                    <div className="h-px flex-1 bg-[var(--line)]" />
                    <span className="text-[11px] text-[var(--muted)]">
                      {list.length} bài
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {list.map((e, i) => (
                    <ExerciseCard
                      key={`${day.dayIndex}-${e.id}-${block}-${i}`}
                      exercise={e}
                      compact
                      dayIndex={day.dayIndex}
                      onSwap={onSwap}
                      avoidJoints={avoidJoints}
                      lowImpact={lowImpact}
                      allowedEquipment={allowedEquipment}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
