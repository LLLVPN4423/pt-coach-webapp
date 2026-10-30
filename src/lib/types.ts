export type Sex = "male" | "female" | "other";

export type Goal =
  | "fat_loss"
  | "muscle_gain"
  | "recomp"
  | "health"
  | "performance";

/** Phong cách / triết lý tập — ảnh hưởng split, sets/reps, ưu tiên bài. */
export type TrainingStyle =
  | "balanced"
  | "hypertrophy"
  | "strength"
  | "to_failure"
  | "science"
  | "gorilla"
  | "full_body"
  | "athletic"
  | "bro_split"
  | "minimalist";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type AgeBand = "teen" | "young" | "mid" | "senior";

export type JointZone =
  | "knee"
  | "hip"
  | "shoulder"
  | "lower_back"
  | "wrist"
  | "ankle"
  | "neck"
  | "elbow";

export type MedicalCondition =
  | "hypertension"
  | "heart_disease"
  | "diabetes"
  | "asthma"
  | "pregnancy"
  | "herniated_disc"
  | "osteoporosis"
  | "recent_surgery"
  | "dizziness"
  | "eating_disorder_history";

export interface MedicalFlags {
  conditions: MedicalCondition[];
  jointZones: JointZone[];
  jointNotes: string;
  cardioNotes: string;
  medicationNotes: string;
  otherNotes: string;
  disclaimerAccepted: boolean;
  hasRedFlags: boolean;
  redFlagNotes: string;
  clinicianCleared: boolean;
}

export interface InBodyMetrics {
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
  skeletalMuscleKg?: number;
  visceralFat?: number;
  measuredAt: string;
}

/** Life / circumstance prefs affecting plan build + daily soft-mod. */
export interface LifeContext {
  scheduleType:
    | "office_9_5"
    | "shift"
    | "student"
    | "freelance"
    | "caregiver";
  preferredSlots: ("morning" | "lunch" | "evening")[];
  maxSessionMin?: number;
  venue: "gym" | "home" | "outdoor" | "hotel_travel";
  equipmentTags: string[];
  travelsOften: boolean;
  examOrDeadlineMode: boolean;
  physicalJob: boolean;
  typicalSleepHours: number;
  baselineStress: number;
  foodBudget: "low" | "mid" | "flexible";
  dietPattern:
    | "none"
    | "vegetarian"
    | "vegan"
    | "lactose_free"
    | "gluten_free";
  eatingWindow: "normal" | "skip_breakfast" | "intermittent_soft";
  heatHumidityAware: boolean;
  caregivingLoad: "none" | "light" | "heavy";
  temporaryFlags: string[];
  contextNote: string;
}

export interface FemaleCyclePrefs {
  cycleTrackingEnabled: boolean;
  avgCycleLength: number;
  lastPeriodStart: string;
  usesHormonalContraceptive: boolean;
  commonSymptoms: string[];
  irregularOrAbsentFlag: boolean;
}

export interface MaleReadinessPrefs {
  readinessTrackingEnabled: boolean;
  prioritizeRecovery: boolean;
  chronicFatigueFlag: boolean;
}

export interface Profile {
  name: string;
  age: number;
  sex: Sex;
  goal: Goal;
  goalNote: string;
  /** Phong cách tập (PPL, failure, science, gorilla…) */
  trainingStyle: TrainingStyle;
  activity: ActivityLevel;
  daysPerWeek: number;
  sessionsPerDay: number;
  sessionMinutes: number;
  availableEquipment: string;
  medical: MedicalFlags;
  life: LifeContext;
  femaleCycle?: FemaleCyclePrefs;
  maleReadiness?: MaleReadinessPrefs;
  createdAt: string;
  updatedAt: string;
}

export const GOAL_LABELS: Record<Goal, string> = {
  fat_loss: "Giảm mỡ",
  muscle_gain: "Tăng cơ",
  recomp: "Recomp (giữ cơ giảm mỡ)",
  health: "Sức khỏe / duy trì",
  performance: "Hiệu suất / sức mạnh",
};

export interface ExerciseSet {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
  cues?: string[];
  avoidIf?: string[];
  imageUrl?: string;
  imageUrlAlt?: string;
  /** 3D workout GIF (ExerciseDB) */
  gifUrl?: string;
  videoUrl?: string;
  videoEmbedUrl?: string;
  muscle?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  sessionBlock?: 1 | 2;
  equipment?: string;
}

export interface WorkoutDay {
  dayIndex: number;
  dayName: string;
  focus: string;
  exercises: ExerciseSet[];
  isRest: boolean;
}

export interface MealItem {
  name: string;
  items: string[];
  approxKcal?: number;
  emoji: string;
  tags: string[];
  allergens: string[];
  swaps: string[];
  tip?: string;
}

export interface NutritionPlan {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterL: number;
  meals: MealItem[];
  notes: string[];
  medicalNotes: string[];
}

export interface TrainingPlan {
  id: string;
  version: number;
  createdAt: string;
  rationale: string;
  ageBand: AgeBand;
  schedule: {
    goal: Goal;
    goalNote: string;
    trainingStyle?: TrainingStyle;
    daysPerWeek: number;
    sessionsPerDay: number;
    sessionMinutes: number;
    weeklyMinutes: number;
  };
  contextSummary?: string;
  contextNotes?: string[];
  sexNotes?: string[];
  mediaVersion?: number;
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  medicalSummary: string[];
}

export interface DayLog {
  date: string;
  workoutDone?: boolean;
  /** Did a lighter/deload version */
  workoutAdjusted?: boolean;
  nutritionOnTrack?: boolean;
  waterGlasses?: number;
  rpe?: number;
  notes?: string;
  sleepHours?: number;
  energy1to5?: number;
  soreness1to5?: number;
  stress1to5?: number;
  wantsDeloadToday?: boolean;
  contextTags?: string[];
  /** Female */
  cycleDay?: number;
  bleeding?: boolean;
  symptoms?: string[];
}

export interface WeightEntry {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
}

export interface Settings {
  groqApiKey?: string;
  units: "metric";
}

export interface AppState {
  profile: Profile | null;
  latestMetrics: InBodyMetrics | null;
  metricsHistory: InBodyMetrics[];
  plan: TrainingPlan | null;
  logs: DayLog[];
  weightLog: WeightEntry[];
  settings: Settings;
  schemaVersion?: number;
}

/** Bump when media/context schema needs regen banner */
export const SCHEMA_VERSION = 3;
export const MEDIA_VERSION = 3;
export const STORAGE_KEY = "pt-desk:v3";

export const CONDITION_LABELS: Record<MedicalCondition, string> = {
  hypertension: "Cao huyết áp",
  heart_disease: "Bệnh tim mạch",
  diabetes: "Tiểu đường",
  asthma: "Hen suyễn",
  pregnancy: "Mang thai / sau sinh",
  herniated_disc: "Thoát vị đĩa đệm",
  osteoporosis: "Loãng xương",
  recent_surgery: "Phẫu thuật gần đây (<3 tháng)",
  dizziness: "Chóng mặt khi gắng sức",
  eating_disorder_history: "Tiền sử rối loạn ăn uống",
};

export const JOINT_LABELS: Record<JointZone, string> = {
  knee: "Gối",
  hip: "Háng",
  shoulder: "Vai",
  lower_back: "Thắt lưng",
  wrist: "Cổ tay",
  ankle: "Cổ chân",
  neck: "Cổ",
  elbow: "Khuỷu",
};
