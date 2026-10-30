"use client";

import { normalizeMedical } from "./medical";
import type { AppState, TrainingPlan } from "./types";
import { STORAGE_KEY } from "./types";

export const defaultState = (): AppState => ({
  profile: null,
  latestMetrics: null,
  metricsHistory: [],
  plan: null,
  logs: [],
  weightLog: [],
  settings: { units: "metric" },
});

/** Patch older localStorage plan shapes so UI never crashes. */
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

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    // Prefer v2; fall back to v1 key once
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("pt-desk:v1");
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    const merged = { ...defaultState(), ...parsed };
    if (merged.profile) {
      merged.profile = {
        ...merged.profile,
        medical: normalizeMedical(merged.profile.medical),
      };
    }
    merged.plan = normalizePlan(merged.plan);
    merged.logs = Array.isArray(merged.logs) ? merged.logs : [];
    merged.weightLog = Array.isArray(merged.weightLog) ? merged.weightLog : [];
    merged.metricsHistory = Array.isArray(merged.metricsHistory)
      ? merged.metricsHistory
      : [];
    return merged;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  if (merged.profile) {
    merged.profile = {
      ...merged.profile,
      medical: normalizeMedical(merged.profile.medical),
    };
  }
  merged.plan = normalizePlan(merged.plan);
  return merged;
}
