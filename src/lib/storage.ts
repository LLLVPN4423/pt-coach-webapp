"use client";

import { normalizeMedical } from "./medical";
import type { AppState } from "./types";
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
  return { ...defaultState(), ...parsed };
}
