export type Sex = "male" | "female" | "other";

export type Goal =
  | "fat_loss"
  | "muscle_gain"
  | "recomp"
  | "health"
  | "performance";

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

/** Richer medical profile — inspired by NTC / Move With Us questionnaires. */
export interface MedicalFlags {
  conditions: MedicalCondition[];
  jointZones: JointZone[];
  jointNotes: string;
  cardioNotes: string;
  medicationNotes: string;
  otherNotes: string;
  /** User confirms plan is not medical advice */
  disclaimerAccepted: boolean;
  /** Pain at rest / chest pain / unexplained dizziness → recommend doctor first */
  hasRedFlags: boolean;
  redFlagNotes: string;
  /** Cleared by clinician for exercise (if conditions present) */
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

export interface Profile {
  name: string;
  age: number;
  sex: Sex;
  goal: Goal;
  activity: ActivityLevel;
  daysPerWeek: number;
  availableEquipment: string;
  medical: MedicalFlags;
  createdAt: string;
  updatedAt: string;
}

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
  gifUrl?: string;
  /** YouTube search / form guide */
  videoUrl?: string;
  muscle?: string;
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
  /** Visual hint */
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
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  medicalSummary: string[];
}

export interface DayLog {
  date: string;
  workoutDone?: boolean;
  nutritionOnTrack?: boolean;
  waterGlasses?: number;
  rpe?: number;
  notes?: string;
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
}

export const STORAGE_KEY = "pt-desk:v2";

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
