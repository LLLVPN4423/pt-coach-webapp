import type {
  DayLog,
  ExerciseLogProgress,
  ExerciseSet,
  MealItem,
} from "./types";

export function exerciseLogKey(ex: ExerciseSet): string {
  return `${ex.sessionBlock ?? 1}:${ex.id}`;
}

export function emptySets(count: number): boolean[] {
  return Array.from({ length: Math.max(1, count) }, () => false);
}

export function getExerciseProgress(
  log: DayLog | undefined,
  ex: ExerciseSet,
  setCount: number,
): ExerciseLogProgress {
  const key = exerciseLogKey(ex);
  const cur = log?.exerciseProgress?.[key];
  if (!cur?.setsDone?.length) return { setsDone: emptySets(setCount) };
  const setsDone = emptySets(setCount).map((_, i) => !!cur.setsDone[i]);
  return { setsDone };
}

export function exerciseFullyDone(progress: ExerciseLogProgress): boolean {
  return progress.setsDone.length > 0 && progress.setsDone.every(Boolean);
}

export function countSetsDone(progress: ExerciseLogProgress): number {
  return progress.setsDone.filter(Boolean).length;
}

export function workoutCompletion(
  exercises: ExerciseSet[],
  log: DayLog | undefined,
  deload?: boolean,
): { done: number; total: number; allDone: boolean; setsDone: number; setsTotal: number } {
  let done = 0;
  let setsDone = 0;
  let setsTotal = 0;
  for (const ex of exercises) {
    const n = deload ? Math.max(1, ex.sets - 1) : ex.sets;
    const p = getExerciseProgress(log, ex, n);
    setsDone += countSetsDone(p);
    setsTotal += n;
    if (exerciseFullyDone(p)) done++;
  }
  const total = exercises.length;
  return {
    done,
    total,
    allDone: total > 0 && done === total,
    setsDone,
    setsTotal,
  };
}

export function mealCompletion(
  meals: MealItem[],
  log: DayLog | undefined,
): { done: number; total: number; allDone: boolean } {
  const total = meals.length;
  let done = 0;
  for (const m of meals) {
    if (log?.mealProgress?.[m.name]) done++;
  }
  return { done, total, allDone: total > 0 && done === total };
}

export function toggleSetInProgress(
  progress: ExerciseLogProgress,
  setIndex: number,
): ExerciseLogProgress {
  const setsDone = [...progress.setsDone];
  if (setIndex < 0 || setIndex >= setsDone.length) return progress;
  setsDone[setIndex] = !setsDone[setIndex];
  return { setsDone };
}
