import {
  ageBand,
  bmrMifflin,
  calorieTarget,
  macroSplit,
  tdeeFromBmr,
} from "./calc";
import { pickByMuscle } from "./exercises";
import { buildMealsFromFoods } from "./foods";
import { medicalPlanNotes } from "./medical";
import type {
  AgeBand,
  ExerciseSet,
  InBodyMetrics,
  Profile,
  TrainingPlan,
  WorkoutDay,
} from "./types";
import { GOAL_LABELS } from "./types";

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

function bandGuidance(band: AgeBand): {
  sets: number;
  rest: number;
  note: string;
} {
  switch (band) {
    case "teen":
      return {
        sets: 3,
        rest: 75,
        note: "Ưu tiên kỹ thuật, tránh max effort; ngủ đủ.",
      };
    case "young":
      return {
        sets: 3,
        rest: 60,
        note: "Có thể tăng volume dần; theo dõi phục hồi.",
      };
    case "mid":
      return {
        sets: 3,
        rest: 75,
        note: "Warm-up kỹ; ưu tiên joint-friendly khi đau khớp.",
      };
    case "senior":
      return {
        sets: 2,
        rest: 90,
        note: "Tempo chậm, ROM thoải mái; cardio nhẹ đều đặn.",
      };
  }
}

function exercisesForMinutes(mins: number): number {
  if (mins <= 30) return 4;
  if (mins <= 45) return 5;
  if (mins <= 60) return 6;
  if (mins <= 75) return 7;
  return 8;
}

function splitForDays(
  days: number,
  band: AgeBand,
): { focus: string; muscles: string[] }[] {
  if (days <= 2) {
    return [
      { focus: "Full body A", muscles: ["legs", "chest", "back", "core"] },
      {
        focus: "Full body B",
        muscles: ["posterior", "shoulders", "arms", "core"],
      },
    ];
  }
  if (days === 3) {
    return [
      { focus: "Upper", muscles: ["chest", "back", "shoulders", "arms"] },
      { focus: "Lower", muscles: ["legs", "posterior", "core"] },
      { focus: "Full + cardio", muscles: ["full", "core", "cardio"] },
    ];
  }
  if (days === 4) {
    return [
      { focus: "Push", muscles: ["chest", "shoulders", "arms"] },
      { focus: "Pull", muscles: ["back", "arms", "core"] },
      { focus: "Legs", muscles: ["legs", "posterior", "core"] },
      { focus: "Active recovery", muscles: ["cardio", "core"] },
    ];
  }
  const base = [
    { focus: "Push", muscles: ["chest", "shoulders", "arms"] },
    { focus: "Pull", muscles: ["back", "arms"] },
    { focus: "Legs", muscles: ["legs", "posterior"] },
    { focus: "Upper pump", muscles: ["chest", "back", "shoulders"] },
    { focus: "Posterior + core", muscles: ["posterior", "core", "cardio"] },
  ];
  if (band === "senior") return base.slice(0, Math.min(days, 4));
  return base.slice(0, Math.min(days, 6));
}

function toSet(
  p: ReturnType<typeof pickByMuscle>[0],
  guide: { sets: number; rest: number },
  band: AgeBand,
  jointSafe: boolean,
  sessionBlock?: 1 | 2,
): ExerciseSet {
  const isCardio = p.muscle === "cardio" || p.category === "cardio";
  return {
    id: p.id,
    name: p.name,
    sets: isCardio ? 1 : guide.sets,
    reps: isCardio ? "20–30 phút" : band === "senior" ? "10–12" : "8–12",
    restSec: isCardio ? 0 : guide.rest,
    notes: jointSafe ? "Giữ ROM không đau — dừng nếu đau nhói" : undefined,
    cues: p.cues,
    avoidIf: p.avoidJoints,
    imageUrl: p.imageUrl,
    imageUrlAlt: p.imageUrlAlt,
    videoUrl: p.videoUrl,
    videoEmbedUrl: p.videoEmbedUrl,
    muscle: p.muscle,
    primaryMuscles: p.primaryMuscles,
    secondaryMuscles: p.secondaryMuscles,
    sessionBlock,
  };
}

export function generatePlan(
  profile: Profile,
  metrics: InBodyMetrics,
  previousVersion = 0,
): TrainingPlan {
  const band = ageBand(profile.age);
  const guide = bandGuidance(band);
  const daysPerWeek = Math.min(7, Math.max(1, profile.daysPerWeek || 3));
  const sessionsPerDay = Math.min(2, Math.max(1, profile.sessionsPerDay || 1));
  const sessionMinutes = Math.min(
    120,
    Math.max(20, profile.sessionMinutes || 45),
  );
  const perSessionCount = exercisesForMinutes(sessionMinutes);

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
    (!medical?.clinicianCleared && conditions.length > 0);

  const avoidJoints = jointZones;
  const templates = splitForDays(daysPerWeek, band);
  const trainIndices: number[] = [];
  const step = Math.max(1, Math.floor(7 / templates.length));
  for (let i = 0; i < templates.length; i++) {
    trainIndices.push(Math.min(6, i * step));
  }

  const workoutDays: WorkoutDay[] = DAY_NAMES.map((dayName, dayIndex) => {
    const tIdx = trainIndices.indexOf(dayIndex);
    if (tIdx === -1) {
      return {
        dayIndex,
        dayName,
        focus: "Nghỉ / đi bộ nhẹ",
        exercises: [
          {
            id: "walk",
            name: "Đi bộ hoặc giãn cơ 20–40 phút",
            sets: 1,
            reps: "1",
            restSec: 0,
            notes: "Active recovery",
            cues: ["Thoải mái", "Không gắng sức"],
            imageUrl:
              "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_High_Knees_March_On_The_Spot/0.jpg",
            videoUrl:
              "https://www.youtube.com/results?search_query=brisk+walk+recovery",
            videoEmbedUrl:
              "https://www.youtube.com/embed?listType=search&list=brisk%20walk%20recovery%20form",
            muscle: "cardio",
            primaryMuscles: ["calves", "quadriceps"],
          },
        ],
        isRest: true,
      };
    }
    const t = templates[tIdx];
    const exercises: ExerciseSet[] = [];

    const blocks = sessionsPerDay >= 2 ? ([1, 2] as const) : ([1] as const);
    for (const block of blocks) {
      const muscles =
        block === 2
          ? [...t.muscles].reverse()
          : t.muscles;
      const target =
        sessionsPerDay >= 2
          ? Math.max(3, Math.ceil(perSessionCount * 0.55))
          : perSessionCount;

      for (const muscle of muscles) {
        if (exercises.filter((e) => e.sessionBlock === block).length >= target)
          break;
        const picks = pickByMuscle(
          muscle,
          { jointSafe, lowImpact, avoidJoints },
          muscle === "cardio" || muscle === "core" ? 1 : 2,
        );
        for (const p of picks) {
          if (
            exercises.filter((e) => e.sessionBlock === block).length >= target
          )
            break;
          if (exercises.some((e) => e.id === p.id)) continue;
          exercises.push(toSet(p, guide, band, jointSafe, block));
        }
      }
    }

    const focusLabel =
      sessionsPerDay >= 2
        ? `${t.focus} · ${sessionsPerDay} buổi × ~${sessionMinutes} phút`
        : `${t.focus} · ~${sessionMinutes} phút`;

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
  const weeklyMinutes = daysPerWeek * sessionsPerDay * sessionMinutes;
  const goalLabel = GOAL_LABELS[profile.goal] ?? profile.goal;
  const notes = [
    guide.note,
    `Mục tiêu: ${goalLabel}${profile.goalNote ? ` — ${profile.goalNote}` : ""}.`,
    `Lịch: ${daysPerWeek} ngày/tuần · ${sessionsPerDay} buổi/ngày · ~${sessionMinutes} phút/buổi (~${weeklyMinutes} phút/tuần).`,
    `BMR ~${bmr} · TDEE ~${tdee} · mục tiêu ${calories} kcal.`,
    ...medNotes.slice(0, 1),
  ];

  return {
    id: uid(),
    version: previousVersion + 1,
    createdAt: new Date().toISOString(),
    rationale: `${goalLabel} · ${daysPerWeek}n/tuần · ${sessionsPerDay}×${sessionMinutes}p · nhóm tuổi ${band}.`,
    ageBand: band,
    schedule: {
      goal: profile.goal,
      goalNote: profile.goalNote || "",
      daysPerWeek,
      sessionsPerDay,
      sessionMinutes,
      weeklyMinutes,
    },
    workoutDays,
    nutrition: {
      dailyCalories: calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
      waterL,
      meals: buildMealsFromFoods(calories, macros.proteinG, profile),
      notes,
      medicalNotes: medNotes,
    },
    medicalSummary: medNotes,
  };
}
