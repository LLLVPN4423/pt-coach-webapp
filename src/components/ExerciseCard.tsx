"use client";

import { useMemo, useState } from "react";
import type { ExerciseSet } from "@/lib/types";
import { alternativesFor, getExercise } from "@/lib/exercises";
import { IconDumbbell, IconRefresh } from "@/components/icons";

export function ExerciseCard({
  exercise,
  compact,
  dayIndex,
  onSwap,
  avoidJoints,
  lowImpact,
}: {
  exercise: ExerciseSet;
  compact?: boolean;
  dayIndex?: number;
  onSwap?: (dayIndex: number, oldId: string, next: ExerciseSet) => void;
  avoidJoints?: string[];
  lowImpact?: boolean;
}) {
  const [imgOk, setImgOk] = useState(true);
  const [open, setOpen] = useState(false);

  const alts = useMemo(() => {
    const tpl = getExercise(exercise.id);
    if (!tpl) return [];
    return alternativesFor(
      tpl,
      { avoidJoints, lowImpact },
      5,
    );
  }, [exercise.id, avoidJoints, lowImpact]);

  const canSwap =
    typeof dayIndex === "number" && typeof onSwap === "function" && alts.length > 0;

  return (
    <article
      className={`flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-white/70 p-2.5 ${
        compact ? "" : "sm:p-3"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--sand)] sm:h-24 sm:w-24">
          {exercise.imageUrl && imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <IconDumbbell size={28} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{exercise.name}</h3>
            <p className="shrink-0 text-sm text-[var(--muted)]">
              {exercise.sets}×{exercise.reps}
              {exercise.restSec > 0 ? ` · nghỉ ${exercise.restSec}s` : ""}
            </p>
          </div>
          {exercise.cues && exercise.cues.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1">
              {exercise.cues.slice(0, compact ? 2 : 4).map((c) => (
                <li
                  key={c}
                  className="chip !bg-[var(--sand)] !text-[var(--muted)]"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
          {exercise.notes && (
            <p className="mt-1 text-xs text-[var(--warn)]">{exercise.notes}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Xem clip / hướng dẫn form →
              </a>
            )}
            {canSwap && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => setOpen((v) => !v)}
              >
                <IconRefresh size={12} />
                {open ? "Đóng" : "Đổi bài"}
              </button>
            )}
          </div>
        </div>
      </div>

      {open && canSwap && (
        <div className="space-y-1.5 border-t border-[var(--line)] pt-2">
          <p className="text-xs text-[var(--muted)]">
            Thay thế cùng nhóm cơ (free-exercise-db)
          </p>
          {alts.map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[var(--sand)]"
              onClick={() => {
                onSwap!(dayIndex!, exercise.id, {
                  id: a.id,
                  name: a.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restSec: exercise.restSec,
                  notes: exercise.notes,
                  cues: a.cues,
                  avoidIf: a.avoidJoints,
                  imageUrl: a.imageUrl,
                  videoUrl: a.videoUrl,
                  muscle: a.muscle,
                });
                setOpen(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.imageUrl}
                alt=""
                className="h-8 w-8 rounded object-cover"
                loading="lazy"
              />
              <span className="min-w-0 flex-1 truncate">{a.name}</span>
              <span className="text-xs text-[var(--muted)]">{a.equipment}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
