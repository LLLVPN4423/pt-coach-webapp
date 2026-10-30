/**
 * Exercise library — 3D GIF animations from ExerciseDB (personal/non-commercial).
 * https://oss.exercisedb.dev — attribute AscendAPI / ExerciseDB.
 */
import catalog from "@/data/exercises-catalog.json";

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscle: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  bodyParts?: string[];
  equipment: string;
  equipmentRaw?: string;
  level: string;
  category?: string;
  jointFriendly: boolean;
  lowImpact: boolean;
  avoidJoints?: string[];
  cues: string[];
  imageUrl: string;
  gifUrl?: string;
}

export const EXERCISES = catalog as ExerciseTemplate[];

export function getExercise(id: string): ExerciseTemplate | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function searchExercises(
  q: string,
  limit = 40,
  filters?: {
    muscle?: string;
    equipment?: string;
    bodyPart?: string;
  },
): ExerciseTemplate[] {
  const s = q.trim().toLowerCase();
  let pool = EXERCISES;
  if (filters?.muscle && filters.muscle !== "all") {
    pool = pool.filter((e) => e.muscle === filters.muscle);
  }
  if (filters?.equipment && filters.equipment !== "all") {
    pool = pool.filter((e) => e.equipment === filters.equipment);
  }
  if (filters?.bodyPart && filters.bodyPart !== "all") {
    pool = pool.filter((e) =>
      e.bodyParts?.some((b) => b.toLowerCase() === filters.bodyPart!.toLowerCase()),
    );
  }
  if (!s) return pool.slice(0, limit);
  return pool
    .filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.muscle.includes(s) ||
        e.equipment.includes(s) ||
        e.primaryMuscles?.some((m) => m.toLowerCase().includes(s)),
    )
    .slice(0, limit);
}

export function alternativesFor(
  ex: ExerciseTemplate,
  opts: { avoidJoints?: string[]; lowImpact?: boolean; equipment?: string },
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
    if (opts.equipment && opts.equipment !== "any") {
      if (e.equipment !== opts.equipment && e.equipment !== "bodyweight")
        return false;
    }
    return true;
  }).slice(0, limit);
}

export function pickByMuscle(
  muscle: string,
  opts: {
    jointSafe?: boolean;
    lowImpact?: boolean;
    avoidJoints?: string[];
    equipmentPrefer?: string[];
    bodyweightOnly?: boolean;
  },
  count: number,
): ExerciseTemplate[] {
  let pool = EXERCISES.filter(
    (e) => e.muscle === muscle || muscle === "full",
  );
  if (muscle === "cardio") {
    pool = EXERCISES.filter(
      (e) =>
        e.category === "cardio" ||
        e.muscle === "cardio" ||
        /walk|bike|cycle|run|march|cardio|jumping jack|burpee/i.test(e.name),
    );
  }
  if (muscle === "core") {
    pool = EXERCISES.filter(
      (e) =>
        e.muscle === "core" ||
        e.primaryMuscles?.some((m) => /abdom/i.test(m)) ||
        /plank|crunch|sit-up|dead bug|hollow/i.test(e.name),
    );
  }
  if (opts.bodyweightOnly) {
    pool = pool.filter((e) => e.equipment === "bodyweight");
  } else if (opts.equipmentPrefer?.length) {
    const pref = pool.filter((e) =>
      opts.equipmentPrefer!.includes(e.equipment),
    );
    if (pref.length >= count) pool = pref;
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

export const MUSCLE_FILTERS = [
  "all",
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "posterior",
  "core",
  "cardio",
  "full",
] as const;

export const EQUIPMENT_FILTERS = [
  "all",
  "bodyweight",
  "dumbbell",
  "barbell",
  "machine",
  "band",
  "kettlebell",
  "any",
] as const;
