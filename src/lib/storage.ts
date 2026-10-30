"use client";

import {
  emptyFemaleCycle,
  emptyLifeContext,
  emptyMaleReadiness,
} from "./context";
import { normalizeMedical } from "./medical";
import type { AppState, Profile, TrainingPlan } from "./types";
import { MEDIA_VERSION, SCHEMA_VERSION, STORAGE_KEY } from "./types";

export const defaultState = (): AppState => ({
  profile: null,
  latestMetrics: null,
  metricsHistory: [],
  plan: null,
  logs: [],
  weightLog: [],
  settings: { units: "metric" },
  schemaVersion: SCHEMA_VERSION,
});

export function normalizeProfile(raw: Profile): Profile {
  return {
    ...raw,
    goalNote: raw.goalNote ?? "",
    daysPerWeek: raw.daysPerWeek || 3,
    sessionsPerDay: raw.sessionsPerDay || 1,
    sessionMinutes: raw.sessionMinutes || 45,
    availableEquipment: raw.availableEquipment || "",
    medical: normalizeMedical(raw.medical),
    life: { ...emptyLifeContext(), ...(raw.life || {}) },
    femaleCycle: raw.femaleCycle
      ? { ...emptyFemaleCycle(), ...raw.femaleCycle }
      : emptyFemaleCycle(),
    maleReadiness: raw.maleReadiness
      ? { ...emptyMaleReadiness(), ...raw.maleReadiness }
      : emptyMaleReadiness(),
  };
}

export function normalizePlan(plan: TrainingPlan | null): TrainingPlan | null {
  if (!plan || typeof plan !== "object") return null;
  const nutrition = plan.nutrition ?? {
    dailyCalories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    waterL: 3,
    meals: [],
    notes: [],
    medicalNotes: [],
  };
  return {
    ...plan,
    workoutDays: Array.isArray(plan.workoutDays) ? plan.workoutDays : [],
    medicalSummary: Array.isArray(plan.medicalSummary)
      ? plan.medicalSummary
      : [],
    contextNotes: Array.isArray(plan.contextNotes) ? plan.contextNotes : [],
    sexNotes: Array.isArray(plan.sexNotes) ? plan.sexNotes : [],
    mediaVersion: plan.mediaVersion ?? 0,
    schedule: plan.schedule ?? {
      goal: "health",
      goalNote: "",
      daysPerWeek: 3,
      sessionsPerDay: 1,
      sessionMinutes: 45,
      weeklyMinutes: 135,
    },
    nutrition: {
      ...nutrition,
      meals: Array.isArray(nutrition.meals) ? nutrition.meals : [],
      notes: Array.isArray(nutrition.notes) ? nutrition.notes : [],
      medicalNotes: Array.isArray(nutrition.medicalNotes)
        ? nutrition.medicalNotes
        : Array.isArray(plan.medicalSummary)
          ? plan.medicalSummary
          : [],
    },
  };
}

export function planNeedsRegen(plan: TrainingPlan | null): boolean {
  if (!plan) return false;
  if ((plan.mediaVersion ?? 0) < MEDIA_VERSION) return true;
  const first = plan.workoutDays?.[0]?.exercises?.[0];
  if (!first) return true;
  const media = first.gifUrl || first.imageUrl || "";
  return !media.includes(".gif");
}

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("pt-desk:v2") ||
      localStorage.getItem("pt-desk:v1");
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    const merged = { ...defaultState(), ...parsed };
    if (merged.profile) merged.profile = normalizeProfile(merged.profile);
    merged.plan = normalizePlan(merged.plan);
    merged.logs = Array.isArray(merged.logs) ? merged.logs : [];
    merged.weightLog = Array.isArray(merged.weightLog) ? merged.weightLog : [];
    merged.metricsHistory = Array.isArray(merged.metricsHistory)
      ? merged.metricsHistory
      : [];
    merged.schemaVersion = SCHEMA_VERSION;
    return merged;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION }),
  );
}

export function exportStateJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importStateJson(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup file");
  }
  const merged = { ...defaultState(), ...parsed };
  if (merged.profile) merged.profile = normalizeProfile(merged.profile);
  merged.plan = normalizePlan(merged.plan);
  return merged;
}
