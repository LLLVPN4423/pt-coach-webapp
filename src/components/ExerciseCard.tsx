"use client";

import { useState } from "react";
import type { ExerciseSet } from "@/lib/types";
import { IconDumbbell } from "@/components/icons";

export function ExerciseCard({
  exercise,
  compact,
}: {
  exercise: ExerciseSet;
  compact?: boolean;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <article
      className={`flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-2.5 ${
        compact ? "" : "sm:p-3"
      }`}
    >
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
              <li key={c} className="chip !bg-[var(--sand)] !text-[var(--muted)]">
                {c}
              </li>
            ))}
          </ul>
        )}
        {exercise.notes && (
          <p className="mt-1 text-xs text-[var(--warn)]">{exercise.notes}</p>
        )}
        {exercise.videoUrl && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Xem clip / hướng dẫn form →
          </a>
        )}
      </div>
    </article>
  );
}
