import type { DayLog, TrainingPlan, WeightEntry } from "./types";

function dayMs(d: string) {
  return new Date(d + "T00:00:00").getTime();
}

export function lastNDates(n: number, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function logMap(logs: DayLog[]): Map<string, DayLog> {
  const m = new Map<string, DayLog>();
  for (const l of logs) m.set(l.date.slice(0, 10), l);
  return m;
}

export function streakWorkout(logs: DayLog[]): number {
  const m = logMap(logs);
  let s = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    const l = m.get(key);
    if (l?.workoutDone || l?.workoutAdjusted) s++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

export function weekWorkoutCount(logs: DayLog[], from = new Date()): number {
  const dates = lastNDates(7, from);
  const m = logMap(logs);
  return dates.filter((d) => m.get(d)?.workoutDone || m.get(d)?.workoutAdjusted)
    .length;
}

export function adherenceSeries(
  logs: DayLog[],
  days: number,
): { date: string; workout: number; nutrition: number; water: number; rpe: number | null }[] {
  const m = logMap(logs);
  return lastNDates(days).map((date) => {
    const l = m.get(date);
    return {
      date,
      workout: l?.workoutDone || l?.workoutAdjusted ? 1 : 0,
      nutrition: l?.nutritionOnTrack ? 1 : 0,
      water: l?.waterGlasses ?? 0,
      rpe: l?.rpe ?? null,
    };
  });
}

export function weeklyScore(
  logs: DayLog[],
  plan: TrainingPlan | null,
): number {
  const days = lastNDates(7);
  const m = logMap(logs);
  const target = plan?.schedule.daysPerWeek ?? 3;
  const waterGoal = Math.round((plan?.nutrition.waterL ?? 3) * 4);
  let workoutPts = 0;
  let nutrPts = 0;
  let waterPts = 0;
  let done = 0;
  for (const d of days) {
    const l = m.get(d);
    if (l?.workoutDone) {
      workoutPts += 1;
      done++;
    } else if (l?.workoutAdjusted) {
      workoutPts += 0.7;
      done++;
    }
    if (l?.nutritionOnTrack) nutrPts += 1;
    if ((l?.waterGlasses ?? 0) >= waterGoal * 0.7) waterPts += 1;
  }
  const w = Math.min(1, done / Math.max(1, target)) * 50;
  const n = (nutrPts / 7) * 25;
  const h = (waterPts / 7) * 25;
  // blend with raw workoutPts weight lightly
  void workoutPts;
  return Math.round(Math.min(100, w + n + h));
}

export function weightSeries(weightLog: WeightEntry[], n = 28) {
  return [...weightLog]
    .sort((a, b) => dayMs(a.date) - dayMs(b.date))
    .slice(-n);
}
