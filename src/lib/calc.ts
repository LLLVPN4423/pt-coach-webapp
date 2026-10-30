import type { ActivityLevel, AgeBand, Goal, Sex } from "./types";

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Mifflin–St Jeor BMR (kcal). */
export function bmrMifflin(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "female") return Math.round(base - 161);
  // male / other → male formula as default
  return Math.round(base + 5);
}

export function tdeeFromBmr(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULT[activity]);
}

export function ageBand(age: number): AgeBand {
  if (age < 18) return "teen";
  if (age <= 35) return "young";
  if (age <= 50) return "mid";
  return "senior";
}

export function calorieTarget(
  tdee: number,
  goal: Goal,
  band: AgeBand,
): number {
  let delta = 0;
  switch (goal) {
    case "fat_loss":
      delta = band === "senior" ? -300 : -400;
      break;
    case "muscle_gain":
      delta = band === "senior" ? 200 : 300;
      break;
    case "recomp":
      delta = -150;
      break;
    case "health":
    case "performance":
      delta = 0;
      break;
  }
  const target = tdee + delta;
  // Soft floor for teens / seniors
  const floor = band === "teen" ? 1800 : band === "senior" ? 1600 : 1400;
  return Math.max(floor, target);
}

export function macroSplit(
  calories: number,
  weightKg: number,
  goal: Goal,
  bodyFatPct?: number,
): { proteinG: number; carbsG: number; fatG: number } {
  let proteinPerKg = 1.6;
  if (goal === "muscle_gain" || goal === "recomp") proteinPerKg = 1.8;
  if (goal === "fat_loss") proteinPerKg = 2.0;
  if (bodyFatPct !== undefined && bodyFatPct > 25) proteinPerKg += 0.1;

  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(
    50,
    Math.round((calories - proteinG * 4 - fatG * 9) / 4),
  );
  return { proteinG, carbsG, fatG };
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function weekdayIndex(d = new Date()): number {
  // JS: 0=Sun → map to Mon=0
  return (d.getDay() + 6) % 7;
}
