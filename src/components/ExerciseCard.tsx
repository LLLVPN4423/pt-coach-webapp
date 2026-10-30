"use client";

import { useMemo, useState } from "react";
import type { ExerciseSet } from "@/lib/types";
import {
  alternativesFor,
  getExercise,
  youtubeEmbedFor,
} from "@/lib/exercises";
import { MuscleMap } from "@/components/MuscleMap";
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
  const [openSwap, setOpenSwap] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const tpl = getExercise(exercise.id);
  const primary = exercise.primaryMuscles ?? tpl?.primaryMuscles ?? [];
  const secondary = exercise.secondaryMuscles ?? tpl?.secondaryMuscles ?? [];
  const embed =
    exercise.videoEmbedUrl ||
    tpl?.videoEmbedUrl ||
    youtubeEmbedFor(exercise.name);

  const alts = useMemo(() => {
    if (!tpl) return [];
    return alternativesFor(tpl, { avoidJoints, lowImpact }, 5);
  }, [tpl, avoidJoints, lowImpact]);

  const canSwap =
    typeof dayIndex === "number" && typeof onSwap === "function" && alts.length > 0;

  return (
    <article className="exercise-card">
      <div className="flex gap-3">
        <button
          type="button"
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--ink-faint)] sm:h-28 sm:w-28"
          onClick={() => setShowVideo((v) => !v)}
          title="Xem clip hướng dẫn"
        >
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
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-semibold text-white">
            ▶ Clip form
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {exercise.sessionBlock != null && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Buổi {exercise.sessionBlock}
                </p>
              )}
              <h3 className="font-semibold leading-snug tracking-tight">
                {exercise.name}
              </h3>
            </div>
            <p className="shrink-0 rounded-lg bg-[var(--sand)] px-2 py-1 text-sm font-semibold tabular-nums">
              {exercise.sets}×{exercise.reps}
              {exercise.restSec > 0 ? (
                <span className="font-normal text-[var(--muted)]">
                  {" "}
                  · {exercise.restSec}s
                </span>
              ) : null}
            </p>
          </div>

          {!compact && (
            <MuscleMap
              primary={primary}
              secondary={secondary}
              className="mt-2"
            />
          )}

          {compact && primary.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {primary.slice(0, 3).map((m) => (
                <span key={m} className="chip chip-hot">
                  {m}
                </span>
              ))}
            </div>
          )}

          {exercise.cues && exercise.cues.length > 0 && !compact && (
            <ul className="mt-2 space-y-0.5 text-xs text-[var(--muted)]">
              {exercise.cues.slice(0, 3).map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          )}

          {exercise.notes && (
            <p className="mt-1 text-xs text-[var(--warn)]">{exercise.notes}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="text-xs font-semibold text-[var(--accent)]"
              onClick={() => setShowVideo((v) => !v)}
            >
              {showVideo ? "Ẩn clip" : "Xem hướng dẫn video"}
            </button>
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--muted)] underline-offset-2 hover:underline"
              >
                Mở YouTube ↗
              </a>
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

      {showVideo && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-black">
          <div className="aspect-video w-full">
            <iframe
              title={`Hướng dẫn: ${exercise.name}`}
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <p className="bg-[var(--ink)] px-3 py-1.5 text-[10px] text-white/70">
            Clip từ YouTube (tìm form đúng) · ảnh minh họa free-exercise-db · sơ đồ
            cơ là schematic, không phải scan 3D y khoa
          </p>
        </div>
      )}

      {openSwap && canSwap && (
        <div className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-2">
          <p className="text-xs text-[var(--muted)]">
            Thay thế cùng nhóm cơ ({alts.length} gợi ý)
          </p>
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
                  imageUrlAlt: a.imageUrlAlt,
                  videoUrl: a.videoUrl,
                  videoEmbedUrl: a.videoEmbedUrl,
                  muscle: a.muscle,
                  primaryMuscles: a.primaryMuscles,
                  secondaryMuscles: a.secondaryMuscles,
                  sessionBlock: exercise.sessionBlock,
                });
                setOpenSwap(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.imageUrl}
                alt=""
                className="h-9 w-9 rounded-lg object-cover"
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
