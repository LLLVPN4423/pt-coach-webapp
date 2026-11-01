import {
  ageBand,
  bmi,
  bmrMifflin,
  calorieTarget,
  macroSplit,
  tdeeFromBmr,
  volumeCapacity,
} from "./calc";
import {
  effectiveSessionMinutes,
  emptyLifeContext,
  lifeContextNotes,
  sexAwareNotes,
} from "./context";
import {
  buildSessionPicks,
  resolveEquipmentProfile,
  type SelectContext,
} from "./exercise-select";
import { buildMealsFromFoods } from "./foods";
import { medicalPlanNotes } from "./medical";
import {
  distributeTrainDays,
  splitForStyle,
  stylePrescription,
  TRAINING_STYLE_LABELS,
} from "./training-styles";
import type {
  AgeBand,
  ExerciseSet,
  InBodyMetrics,
  Profile,
  TrainingPlan,
  TrainingStyle,
  WorkoutDay,
} from "./types";
import { GOAL_LABELS, MEDIA_VERSION } from "./types";

const DAY_NAMES = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "CN",
];

function uid(): string {
  return `plan_${Date.now().toString(36)}`;
}

function bandGuidance(band: AgeBand) {
  switch (band) {
    case "teen":
      return { sets: 3, rest: 75, note: "Ưu tiên kỹ thuật; ngủ đủ." };
    case "young":
      return { sets: 3, rest: 60, note: "Tăng volume dần; theo dõi phục hồi." };
    case "mid":
      return { sets: 3, rest: 75, note: "Warm-up kỹ; joint-friendly khi đau." };
    case "senior":
      return { sets: 2, rest: 90, note: "Tempo chậm; cardio nhẹ đều." };
  }
}

function exercisesForMinutes(mins: number, volumeScale = 1): number {
  let n = 6;
  if (mins <= 25) n = 4;
  else if (mins <= 35) n = 5;
  else if (mins <= 45) n = 6;
  else if (mins <= 60) n = 7;
  else if (mins <= 75) n = 8;
  else n = 9;
  return Math.max(4, Math.min(10, Math.round(n * volumeScale)));
}

function adjustRepsForBias(
  reps: string,
  bias: "strength" | "hypertrophy" | "endurance",
  isCardio: boolean,
): string {
  if (isCardio) return reps;
  if (bias === "strength") {
    if (/3\s*[–-]\s*6/.test(reps)) return "5–8";
    if (/5\s*[–-]\s*8/.test(reps)) return "5–8";
    return reps.includes("RIR") ? reps : "5–8";
  }
  if (bias === "endurance") {
    if (/3\s*[–-]\s*6|5\s*[–-]\s*8/.test(reps)) return "10–15";
    if (/6\s*[–-]\s*10|8\s*[–-]\s*12/.test(reps)) return "10–15";
    return reps.includes("RIR") ? "10–15 (RIR 1–3)" : "10–15";
  }
  // hypertrophy default — bump very low strength ranges up for general gym
  if (/3\s*[–-]\s*6/.test(reps)) return "6–10";
  return reps;
}

function resolveStyle(profile: Profile): TrainingStyle {
  return profile.trainingStyle || "balanced";
}

function toSet(
  p: {
    id: string;
    name: string;
    muscle: string;
    category?: string;
    cues: string[];
    avoidJoints?: string[];
    imageUrl: string;
    gifUrl?: string;
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    equipment: string;
  },
  rx: ReturnType<typeof stylePrescription>,
  jointSafe: boolean,
  sessionBlock?: 1 | 2,
  styleNote?: string,
): ExerciseSet {
  const isCardio = p.muscle === "cardio" || p.category === "cardio";
  const notes = [jointSafe ? "Giữ ROM không đau" : null, styleNote]
    .filter(Boolean)
    .join(" · ");
  return {
    id: p.id,
    name: p.name,
    sets: isCardio ? 1 : rx.sets,
    reps: isCardio ? "15–25 phút" : rx.reps,
    restSec: isCardio ? 0 : rx.restSec,
    notes: notes || undefined,
    cues: p.cues,
    avoidIf: p.avoidJoints,
    imageUrl: p.imageUrl,
    gifUrl: p.gifUrl || p.imageUrl,
    muscle: p.muscle,
    primaryMuscles: p.primaryMuscles,
    secondaryMuscles: p.secondaryMuscles,
    sessionBlock,
    equipment: p.equipment,
  };
}

export function generatePlan(
  profile: Profile,
  metrics: InBodyMetrics,
  previousVersion = 0,
): TrainingPlan {
  const band = ageBand(profile.age);
  const guide = bandGuidance(band);
  const style = resolveStyle(profile);
  const baseRx = stylePrescription(style, band, guide);
  const styleLabel = TRAINING_STYLE_LABELS[style];

  let daysPerWeek = Math.min(7, Math.max(1, profile.daysPerWeek || 3));
  if (profile.life?.caregivingLoad === "heavy")
    daysPerWeek = Math.min(daysPerWeek, 3);
  if (profile.life?.examOrDeadlineMode)
    daysPerWeek = Math.min(daysPerWeek, 3);
  if (style === "bro_split") daysPerWeek = Math.max(daysPerWeek, 4);
  if (style === "minimalist") daysPerWeek = Math.min(daysPerWeek, 4);

  const sessionsPerDay = Math.min(2, Math.max(1, profile.sessionsPerDay || 1));
  const sessionMinutes = effectiveSessionMinutes(profile);
  const equipment = resolveEquipmentProfile(profile);

  const bmr = bmrMifflin(
    metrics.weightKg,
    metrics.heightCm,
    profile.age,
    profile.sex,
  );
  const tdee = tdeeFromBmr(bmr, profile.activity);
  let calories = calorieTarget(tdee, profile.goal, band);
  const conditions = profile.medical?.conditions ?? [];
  if (conditions.includes("eating_disorder_history")) {
    calories = Math.max(calories, tdee - 100);
  }
  if (conditions.includes("pregnancy")) {
    calories = Math.max(calories, tdee);
  }

  const macros = macroSplit(
    calories,
    metrics.weightKg,
    profile.goal,
    metrics.bodyFatPct,
  );

  const medical = profile.medical;
  const jointZones = medical?.jointZones ?? [];
  const jointSafe =
    jointZones.length > 0 ||
    conditions.includes("herniated_disc") ||
    conditions.includes("osteoporosis");
  const lowImpact =
    jointSafe ||
    conditions.includes("heart_disease") ||
    conditions.includes("hypertension") ||
    conditions.includes("pregnancy") ||
    medical?.hasRedFlags ||
    band === "senior" ||
    (!medical?.clinicianCleared && conditions.length > 0) ||
    profile.life?.temporaryFlags?.includes("minor_injury_flare");

  const cap = volumeCapacity({
    weightKg: metrics.weightKg,
    heightCm: metrics.heightCm,
    bodyFatPct: metrics.bodyFatPct,
    band,
    lowImpact,
    goal: profile.goal,
  });

  const rx = {
    ...baseRx,
    sets: Math.min(6, Math.max(2, baseRx.sets + cap.setBonus)),
    restSec: Math.round(baseRx.restSec * cap.restMult),
    reps: adjustRepsForBias(baseRx.reps, cap.repBias, false),
  };

  const perSessionCount = exercisesForMinutes(
    sessionMinutes,
    (baseRx.volumeScale ?? 1) * cap.exerciseScale,
  );

  const templates = splitForStyle(style, daysPerWeek, band);
  const trainIndices = distributeTrainDays(templates.length);

  let travelDayIdx = -1;
  if (profile.life?.travelsOften && trainIndices.length) {
    travelDayIdx = trainIndices[trainIndices.length - 1];
  }

  const weekUsed = new Set<string>();

  const workoutDays: WorkoutDay[] = DAY_NAMES.map((dayName, dayIndex) => {
    const tIdx = trainIndices.indexOf(dayIndex);
    if (tIdx === -1) {
      return {
        dayIndex,
        dayName,
        focus: "Nghỉ / đi bộ nhẹ",
        exercises: [
          {
            id: "walk_recovery",
            name: "Brisk walk / mobility 20–40 phút",
            sets: 1,
            reps: "1",
            restSec: 0,
            notes: "Active recovery · xen kẽ đều với ngày tập",
            cues: ["Thoải mái", "Không gắng sức"],
            imageUrl: "https://static.exercisedb.dev/media/01qpYSe.gif",
            gifUrl: "https://static.exercisedb.dev/media/01qpYSe.gif",
            muscle: "cardio",
            primaryMuscles: ["cardiovascular system"],
            equipment: "bodyweight",
          },
        ],
        isRest: true,
      };
    }
    const t = templates[tIdx % templates.length];
    const isTravel = dayIndex === travelDayIdx;
    const exercises: ExerciseSet[] = [];
    const blocks = sessionsPerDay >= 2 ? ([1, 2] as const) : ([1] as const);
    const failCue =
      style === "to_failure"
        ? "Set cuối gần failure (đừng phá form)"
        : style === "science"
          ? "Để RIR 1–3"
          : undefined;

    const selectCtx: SelectContext = {
      style,
      goal: profile.goal,
      band,
      jointSafe,
      lowImpact: lowImpact || isTravel,
      avoidJoints: jointZones,
      equipment: isTravel
        ? {
            ...equipment,
            venue: "hotel_travel",
            allowed: ["bodyweight", "band", "dumbbell"],
            preferred: ["bodyweight", "band"],
            strict: true,
            summary: "Ngày travel · bodyweight / band",
          }
        : equipment,
      physicalJob: !!profile.life?.physicalJob,
      travelMode: isTravel,
    };

    for (const block of blocks) {
      const muscles = block === 2 ? [...t.muscles].reverse() : t.muscles;
      let muscleList = [...muscles];
      if (profile.life?.physicalJob) {
        muscleList = muscles.filter((m) => m !== "legs" && m !== "posterior");
        if (!muscleList.length) muscleList = ["chest", "back", "core"];
      }
      const target =
        sessionsPerDay >= 2
          ? Math.max(4, Math.ceil(perSessionCount * 0.55))
          : perSessionCount;

      const picks = buildSessionPicks(
        muscleList,
        target,
        selectCtx,
        weekUsed,
      );
      for (const p of picks) {
        const isCardio = p.muscle === "cardio" || p.category === "cardio";
        const localRx = {
          ...rx,
          reps: isCardio
            ? "15–25 phút"
            : adjustRepsForBias(rx.reps, cap.repBias, false),
        };
        exercises.push(toSet(p, localRx, jointSafe, block, failCue));
      }
    }

    const focusLabel = [
      isTravel ? "Travel / BW" : t.focus,
      equipment.venue !== "gym" ? equipment.venue : null,
      sessionsPerDay >= 2 ? `${sessionsPerDay} buổi` : null,
      `~${sessionMinutes}p`,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      dayIndex,
      dayName,
      focus: focusLabel,
      exercises,
      isRest: false,
    };
  });

  const waterL =
    band === "senior" ? 2.5 : profile.goal === "muscle_gain" ? 3.5 : 3.0;
  const medNotes = medicalPlanNotes(profile);
  const ctxNotes = lifeContextNotes(profile.life || emptyLifeContext());
  const sNotes = sexAwareNotes(profile);
  const weeklyMinutes = daysPerWeek * sessionsPerDay * sessionMinutes;
  const goalLabel = GOAL_LABELS[profile.goal] ?? profile.goal;
  const restDays = 7 - trainIndices.length;
  const trainPattern = trainIndices
    .map((i) => DAY_NAMES[i].replace("Thứ ", "T"))
    .join(" · ");

  const bmiVal = bmi(metrics.weightKg, metrics.heightCm);
  const notes = [
    guide.note,
    rx.note,
    cap.note,
    `Thiết bị: ${equipment.summary}.`,
    `Phong cách: ${styleLabel}.`,
    `Mục tiêu: ${goalLabel}${profile.goalNote ? ` — ${profile.goalNote}` : ""}.`,
    `Lịch: tập ${trainPattern} (${daysPerWeek} ngày) · nghỉ ${restDays} ngày xen đều · ${sessionsPerDay}×${sessionMinutes}p (~${weeklyMinutes}p/tuần).`,
    `BMR ~${bmr} · TDEE ~${tdee} · ${calories} kcal · BMI ${bmiVal}.`,
    ...sNotes.slice(0, 2),
    ...ctxNotes.slice(0, 3),
    ...medNotes.slice(0, 1),
  ];

  return {
    id: uid(),
    version: previousVersion + 1,
    createdAt: new Date().toISOString(),
    rationale: `${styleLabel} · ${equipment.venue} · BMI ${bmiVal} · ${goalLabel} · ${daysPerWeek}n · ${sessionsPerDay}×${sessionMinutes}p`,
    ageBand: band,
    schedule: {
      goal: profile.goal,
      goalNote: profile.goalNote || "",
      trainingStyle: style,
      daysPerWeek,
      sessionsPerDay,
      sessionMinutes,
      weeklyMinutes,
    },
    contextSummary: ctxNotes[0] || "",
    contextNotes: ctxNotes,
    sexNotes: sNotes,
    mediaVersion: MEDIA_VERSION,
    workoutDays,
    nutrition: {
      dailyCalories: calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
      waterL: profile.life?.heatHumidityAware ? waterL + 0.3 : waterL,
      meals: buildMealsFromFoods(calories, macros.proteinG, profile),
      notes,
      medicalNotes: [...medNotes, ...sNotes],
    },
    medicalSummary: medNotes,
  };
}
