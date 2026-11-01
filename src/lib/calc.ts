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

export type BmiClass = "underweight" | "normal" | "overweight" | "obese";

export function bmiClass(value: number): BmiClass {
  if (value < 18.5) return "underweight";
  if (value < 25) return "normal";
  if (value < 30) return "overweight";
  return "obese";
}

export const BMI_CLASS_LABELS: Record<BmiClass, string> = {
  underweight: "Thiếu cân",
  normal: "Bình thường",
  overweight: "Thừa cân",
  obese: "Béo phì",
};

/**
 * Ước lượng khả năng chịu volume từ BMI + % mỡ (nếu có).
 * Tăng số bài / hiệp khi thể trạng cho phép — tránh plan quá nhẹ.
 */
export function volumeCapacity(opts: {
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
  band: AgeBand;
  lowImpact?: boolean;
  goal: Goal;
}): {
  bmi: number;
  bmiClass: BmiClass;
  setBonus: number;
  exerciseScale: number;
  restMult: number;
  repBias: "strength" | "hypertrophy" | "endurance";
  note: string;
} {
  const value = bmi(opts.weightKg, opts.heightCm);
  const cls = bmiClass(value);
  let setBonus = 0;
  let exerciseScale = 1;
  let restMult = 1;
  let repBias: "strength" | "hypertrophy" | "endurance" = "hypertrophy";

  switch (cls) {
    case "underweight":
      setBonus = 0;
      exerciseScale = 1.05;
      restMult = 1.1;
      repBias = "hypertrophy";
      break;
    case "normal":
      setBonus = 1;
      exerciseScale = 1.2;
      restMult = 1;
      repBias = opts.goal === "performance" ? "strength" : "hypertrophy";
      break;
    case "overweight":
      setBonus = 1;
      exerciseScale = 1.25;
      restMult = 0.95;
      repBias = "hypertrophy";
      break;
    case "obese":
      setBonus = opts.lowImpact ? 0 : 1;
      exerciseScale = opts.lowImpact ? 1.0 : 1.15;
      restMult = 1.05;
      repBias = "endurance";
      break;
  }

  if (opts.bodyFatPct != null) {
    if (opts.bodyFatPct < 15 && opts.goal === "muscle_gain") {
      setBonus += 1;
      exerciseScale += 0.1;
      repBias = "strength";
    } else if (opts.bodyFatPct > 28) {
      exerciseScale += 0.08;
      repBias = "endurance";
    }
  }

  if (opts.band === "teen") {
    setBonus = Math.min(setBonus, 1);
    exerciseScale = Math.min(exerciseScale, 1.15);
  }
  if (opts.band === "senior" || opts.lowImpact) {
    setBonus = Math.max(0, setBonus - 1);
    exerciseScale = Math.min(exerciseScale, 1.1);
    restMult = Math.max(restMult, 1.15);
  }

  return {
    bmi: value,
    bmiClass: cls,
    setBonus,
    exerciseScale: Math.round(exerciseScale * 100) / 100,
    restMult: Math.round(restMult * 100) / 100,
    repBias,
    note: `BMI ${value} (${BMI_CLASS_LABELS[cls]}) → volume ×${Math.round(exerciseScale * 100) / 100}, +${setBonus} hiệp nền.`,
  };
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function weekdayIndex(d = new Date()): number {
  // JS: 0=Sun → map to Mon=0
  return (d.getDay() + 6) % 7;
}
