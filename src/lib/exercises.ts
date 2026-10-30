/**
 * Exercise library backed by free-exercise-db (open dataset + GitHub-hosted images).
 * https://github.com/yuhonas/free-exercise-db
 */
import catalog from "@/data/exercises-catalog.json";

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscle: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment: string;
  level: "beginner" | "intermediate" | string;
  category?: string;
  jointFriendly: boolean;
  lowImpact: boolean;
  avoidJoints?: string[];
  cues: string[];
  imageUrl: string;
  videoUrl: string;
}

export const EXERCISES = catalog as ExerciseTemplate[];

export function getExercise(id: string): ExerciseTemplate | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function searchExercises(q: string, limit = 20): ExerciseTemplate[] {
  const s = q.trim().toLowerCase();
  if (!s) return EXERCISES.slice(0, limit);
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(s) ||
      e.muscle.includes(s) ||
      e.equipment.includes(s) ||
      e.primaryMuscles?.some((m) => m.toLowerCase().includes(s)),
  ).slice(0, limit);
}

export function alternativesFor(
  ex: ExerciseTemplate,
  opts: { avoidJoints?: string[]; lowImpact?: boolean },
  limit = 6,
): ExerciseTemplate[] {
  return EXERCISES.filter((e) => {
    if (e.id === ex.id) return false;
    if (e.muscle !== ex.muscle && e.muscle !== "full") return false;
    if (opts.lowImpact && !e.lowImpact) return false;
    if (
      opts.avoidJoints?.length &&
      e.avoidJoints?.some((j) => opts.avoidJoints!.includes(j))
    )
      return false;
    return true;
  }).slice(0, limit);
}

export function pickByMuscle(
  muscle: string,
  opts: {
    jointSafe?: boolean;
    lowImpact?: boolean;
    avoidJoints?: string[];
  },
  count: number,
): ExerciseTemplate[] {
  let pool = EXERCISES.filter(
    (e) => e.muscle === muscle || muscle === "full",
  );
  // cardio/stretch: use category
  if (muscle === "cardio") {
    pool = EXERCISES.filter(
      (e) =>
        e.category === "cardio" ||
        /walk|bike|cycle|run|march|cardio/i.test(e.name),
    );
  }
  if (opts.jointSafe) pool = pool.filter((e) => e.jointFriendly);
  if (opts.lowImpact) pool = pool.filter((e) => e.lowImpact);
  if (opts.avoidJoints?.length) {
    pool = pool.filter(
      (e) => !e.avoidJoints?.some((j) => opts.avoidJoints!.includes(j)),
    );
  }
  if (pool.length < count) {
    pool = EXERCISES.filter((e) => e.jointFriendly && e.lowImpact);
  }
  // Stable variety: rotate by muscle hash
  const start = muscle.length % Math.max(pool.length, 1);
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  const out: ExerciseTemplate[] = [];
  const seen = new Set<string>();
  for (const e of rotated) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
    if (out.length >= count) break;
  }
  return out;
}
