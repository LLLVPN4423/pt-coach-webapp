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
  return base.slice(0, Math.min(days, 5));
}

export function generatePlan(
  profile: Profile,
  metrics: InBodyMetrics,
  previousVersion = 0,
): TrainingPlan {
  const band = ageBand(profile.age);
  const guide = bandGuidance(band);
  const bmr = bmrMifflin(
    metrics.weightKg,
    metrics.heightCm,
    profile.age,
    profile.sex,
  );
  const tdee = tdeeFromBmr(bmr, profile.activity);
  let calories = calorieTarget(tdee, profile.goal, band);
  if (profile.medical.conditions.includes("eating_disorder_history")) {
    calories = Math.max(calories, tdee - 100);
  }
  if (profile.medical.conditions.includes("pregnancy")) {
    calories = Math.max(calories, tdee);
  }

  const macros = macroSplit(
    calories,
    metrics.weightKg,
    profile.goal,
    metrics.bodyFatPct,
  );

  const jointSafe =
    profile.medical.jointZones.length > 0 ||
    profile.medical.conditions.includes("herniated_disc") ||
    profile.medical.conditions.includes("osteoporosis");
  const lowImpact =
    jointSafe ||
    profile.medical.conditions.includes("heart_disease") ||
    profile.medical.conditions.includes("hypertension") ||
    profile.medical.conditions.includes("pregnancy") ||
    profile.medical.hasRedFlags ||
    band === "senior" ||
    (!profile.medical.clinicianCleared &&
      profile.medical.conditions.length > 0);

  const avoidJoints = profile.medical.jointZones;
  const templates = splitForDays(profile.daysPerWeek, band);
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
            muscle: "cardio",
          },
        ],
        isRest: true,
      };
    }
    const t = templates[tIdx];
    const exercises: ExerciseSet[] = [];
    for (const muscle of t.muscles) {
      const picks = pickByMuscle(
        muscle,
        {
          jointSafe,
          lowImpact,
          avoidJoints,
        },
        muscle === "cardio" || muscle === "core" ? 1 : 2,
      );
      for (const p of picks) {
        const isCardio = p.muscle === "cardio";
        exercises.push({
          id: p.id,
          name: p.name,
          sets: isCardio ? 1 : guide.sets,
          reps: isCardio
            ? "20–30 phút"
            : band === "senior"
              ? "10–12"
              : "8–12",
          restSec: isCardio ? 0 : guide.rest,
          notes: jointSafe ? "Giữ ROM không đau — dừng nếu đau nhói" : undefined,
          cues: p.cues,
          avoidIf: p.avoidJoints,
          imageUrl: p.imageUrl,
          videoUrl: p.videoUrl,
          muscle: p.muscle,
        });
      }
    }
    const seen = new Set<string>();
    const unique = exercises.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    return {
      dayIndex,
      dayName,
      focus: t.focus,
      exercises: unique.slice(0, 7),
      isRest: false,
    };
  });

  const waterL =
    band === "senior" ? 2.5 : profile.goal === "muscle_gain" ? 3.5 : 3.0;

  const medNotes = medicalPlanNotes(profile);
  const notes = [
    guide.note,
    `BMR ~${bmr} · TDEE ~${tdee} · mục tiêu ${calories} kcal.`,
    ...medNotes.slice(0, 1),
  ];

  return {
    id: uid(),
    version: previousVersion + 1,
    createdAt: new Date().toISOString(),
    rationale: `Nhóm tuổi ${band} · ${profile.daysPerWeek} buổi/tuần · mục tiêu ${profile.goal}.`,
    ageBand: band,
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
