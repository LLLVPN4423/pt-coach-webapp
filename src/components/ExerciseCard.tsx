"use client";

import { useMemo, useState } from "react";
import type { ExerciseSet } from "@/lib/types";
import { alternativesFor, getExercise } from "@/lib/exercises";
import { MuscleMap } from "@/components/MuscleMap";
import { IconDumbbell, IconRefresh } from "@/components/icons";

function formatRest(sec: number): string {
  if (!sec || sec <= 0) return "—";
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}p${s}s` : `${m} phút`;
}

export function ExerciseCard({
  exercise,
  compact,
  dayIndex,
  onSwap,
  avoidJoints,
  lowImpact,
  deload,
  setsDone,
  onToggleSet,
}: {
  exercise: ExerciseSet;
  compact?: boolean;
  dayIndex?: number;
  onSwap?: (dayIndex: number, oldId: string, next: ExerciseSet) => void;
  avoidJoints?: string[];
  lowImpact?: boolean;
  deload?: boolean;
  /** Tiến độ từng hiệp (Hôm nay) */
  setsDone?: boolean[];
  onToggleSet?: (setIndex: number) => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const [openSwap, setOpenSwap] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const tpl = getExercise(exercise.id);
  const primary = exercise.primaryMuscles ?? tpl?.primaryMuscles ?? [];
  const secondary = exercise.secondaryMuscles ?? tpl?.secondaryMuscles ?? [];
  const gif = exercise.gifUrl || exercise.imageUrl || tpl?.gifUrl || tpl?.imageUrl;
  const sets = deload ? Math.max(1, exercise.sets - 1) : exercise.sets;
  const restSec = exercise.restSec ?? 0;
  const trackable = typeof onToggleSet === "function";
  const doneCount = setsDone?.filter(Boolean).length ?? 0;

  const alts = useMemo(() => {
    if (!tpl) return [];
    return alternativesFor(
      tpl,
      { avoidJoints, lowImpact: lowImpact || deload },
      5,
    );
  }, [tpl, avoidJoints, lowImpact, deload]);

  const canSwap =
    typeof dayIndex === "number" && typeof onSwap === "function" && alts.length > 0;

  const showDetail = !compact || openDetail;

  return (
    <article
      className={`exercise-card ${compact ? "exercise-card--compact" : ""} ${
        trackable && doneCount === sets ? "ring-1 ring-[var(--accent)]" : ""
      }`}
    >
      <div className="flex gap-3">
        <button
          type="button"
          className={`relative shrink-0 overflow-hidden rounded-xl bg-[var(--ink-faint)] ${
            compact
              ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
              : "h-28 w-28 rounded-2xl sm:h-32 sm:w-32"
          }`}
          onClick={() => setLightbox(true)}
          title="Xem animation 3D"
        >
          {gif && imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gif}
              alt={exercise.name}
              className="h-full w-full object-contain bg-[var(--surface)]"
              loading="lazy"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <IconDumbbell size={compact ? 20 : 28} />
            </div>
          )}
          {!compact && (
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-1.5 py-1 text-[10px] font-semibold text-white">
              3D GIF
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {!compact && exercise.sessionBlock != null && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Buổi {exercise.sessionBlock}
                </p>
              )}
              <h3
                className={`font-display font-semibold leading-snug ${
                  compact ? "text-sm sm:text-[0.95rem]" : ""
                }`}
              >
                {exercise.name}
              </h3>
            </div>
            <div className="shrink-0 rounded-xl bg-[var(--sand)] px-2.5 py-1.5 text-right">
              <p className="font-display text-sm font-bold tabular-nums leading-tight">
                {sets} hiệp
                {deload ? (
                  <span className="ml-1 text-[10px] font-bold text-[var(--warn)]">
                    nhẹ
                  </span>
                ) : null}
              </p>
              <p className="text-[11px] font-semibold tabular-nums text-[var(--text)]">
                {/phút|min/i.test(exercise.reps)
                  ? exercise.reps
                  : `${exercise.reps} cái/hiệp`}
              </p>
              {restSec > 0 ? (
                <p className="text-[10px] font-medium text-[var(--muted)]">
                  Nghỉ {formatRest(restSec)} giữa hiệp
                </p>
              ) : (
                <p className="text-[10px] font-medium text-[var(--muted)]">
                  Cardio / liên tục
                </p>
              )}
            </div>
          </div>

          {compact && !openDetail && primary.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {primary.slice(0, 2).map((m) => (
                <span key={m} className="chip chip-hot">
                  {m}
                </span>
              ))}
              {secondary.slice(0, 1).map((m) => (
                <span key={m} className="chip chip-soft">
                  {m}
                </span>
              ))}
            </div>
          )}

          {showDetail && (
            <>
              <MuscleMap
                primary={primary}
                secondary={secondary}
                className="mt-2"
              />
              {exercise.cues && exercise.cues.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
                  {exercise.cues.slice(0, 2).map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          {exercise.notes && (
            <p className="mt-1 text-xs text-[var(--warn)]">{exercise.notes}</p>
          )}

          {trackable && (
            <div className="mt-2.5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Tick từng hiệp · {doneCount}/{sets}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: sets }).map((_, i) => {
                  const on = !!setsDone?.[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onToggleSet?.(i)}
                      className={`min-w-[2.5rem] rounded-lg border px-2 py-1.5 text-xs font-bold tabular-nums ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                          : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                      }`}
                      aria-pressed={on}
                    >
                      H{i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-3">
            {compact && (
              <button
                type="button"
                className="text-xs font-semibold text-[var(--accent)]"
                onClick={() => setOpenDetail((v) => !v)}
              >
                {openDetail ? "Thu gọn" : "Chi tiết · sơ đồ cơ"}
              </button>
            )}
            {!compact && (
              <button
                type="button"
                className="text-xs font-semibold text-[var(--accent)]"
                onClick={() => setLightbox(true)}
              >
                Phóng animation
              </button>
            )}
            {compact && (
              <button
                type="button"
                className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => setLightbox(true)}
              >
                Xem GIF
              </button>
            )}
            {canSwap && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => setOpenSwap((v) => !v)}
              >
                <IconRefresh size={12} />
                {openSwap ? "Đóng" : "Đổi bài"}
              </button>
            )}
          </div>
        </div>
      </div>

      {lightbox && gif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(false)}
          role="presentation"
        >
          <div
            className="max-h-[90vh] max-w-lg overflow-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gif} alt={exercise.name} className="w-full object-contain" />
            <p className="mt-2 text-center text-sm font-semibold">{exercise.name}</p>
            <p className="text-center text-xs text-[var(--muted)]">
              {sets} hiệp · {exercise.reps} cái · nghỉ {formatRest(restSec)}
            </p>
            <div className="mt-2">
              <MuscleMap primary={primary} secondary={secondary} />
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
              3D workout animation · Gym Visual · personal / educational use
            </p>
            <button
              type="button"
              className="btn btn-ghost mt-2 w-full"
              onClick={() => setLightbox(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {openSwap && canSwap && (
        <div className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-2">
          {alts.map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-[var(--sand)]"
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
                  gifUrl: a.gifUrl,
                  muscle: a.muscle,
                  primaryMuscles: a.primaryMuscles,
                  secondaryMuscles: a.secondaryMuscles,
                  sessionBlock: exercise.sessionBlock,
                  equipment: a.equipment,
                });
                setOpenSwap(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.gifUrl || a.imageUrl}
                alt=""
                className="h-10 w-10 rounded-lg object-contain bg-[var(--surface)]"
                loading="lazy"
              />
              <span className="min-w-0 flex-1 truncate">{a.name}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
