"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { generatePlan } from "@/lib/plan-generator";
import {
  defaultState,
  exportStateJson,
  importStateJson,
  loadState,
  saveState,
} from "@/lib/storage";
import { todayKey } from "@/lib/calc";
import type {
  AppState,
  DayLog,
  InBodyMetrics,
  Profile,
  Settings,
  WeightEntry,
} from "@/lib/types";

interface PtStore extends AppState {
  hydrated: boolean;
  setProfile: (profile: Profile) => void;
  setMetrics: (metrics: InBodyMetrics) => void;
  bootstrap: (profile: Profile, metrics: InBodyMetrics) => void;
  regeneratePlan: () => void;
  updateLog: (patch: Partial<DayLog> & { date?: string }) => void;
  addWeight: (entry: WeightEntry) => void;
  setSettings: (settings: Partial<Settings>) => void;
  exportBackup: () => string;
  importBackup: (json: string) => void;
  resetAll: () => void;
  todayLog: DayLog | undefined;
}

const Ctx = createContext<PtStore | null>(null);

export function PtStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const setProfile = useCallback((profile: Profile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const setMetrics = useCallback((metrics: InBodyMetrics) => {
    setState((s) => {
      const history = [
        metrics,
        ...s.metricsHistory.filter((m) => m.measuredAt !== metrics.measuredAt),
      ].slice(0, 60);
      const weightLog: WeightEntry[] = [
        {
          date: metrics.measuredAt.slice(0, 10),
          weightKg: metrics.weightKg,
          bodyFatPct: metrics.bodyFatPct,
        },
        ...s.weightLog.filter(
          (w) => w.date !== metrics.measuredAt.slice(0, 10),
        ),
      ].slice(0, 120);
      const next = {
        ...s,
        latestMetrics: metrics,
        metricsHistory: history,
        weightLog,
      };
      if (s.profile) {
        next.plan = generatePlan(s.profile, metrics, s.plan?.version ?? 0);
      }
      return next;
    });
  }, []);

  const bootstrap = useCallback((profile: Profile, metrics: InBodyMetrics) => {
    const plan = generatePlan(profile, metrics, 0);
    const weightLog: WeightEntry[] = [
      {
        date: metrics.measuredAt.slice(0, 10),
        weightKg: metrics.weightKg,
        bodyFatPct: metrics.bodyFatPct,
      },
    ];
    setState({
      ...defaultState(),
      profile,
      latestMetrics: metrics,
      metricsHistory: [metrics],
      weightLog,
      plan,
      settings: { units: "metric" },
    });
  }, []);

  const regeneratePlan = useCallback(() => {
    setState((s) => {
      if (!s.profile || !s.latestMetrics) return s;
      return {
        ...s,
        plan: generatePlan(s.profile, s.latestMetrics, s.plan?.version ?? 0),
      };
    });
  }, []);

  const updateLog = useCallback(
    (patch: Partial<DayLog> & { date?: string }) => {
      const date = patch.date ?? todayKey();
      setState((s) => {
        const existing = s.logs.find((l) => l.date === date);
        const nextLog: DayLog = { date, ...existing, ...patch };
        return {
          ...s,
          logs: [nextLog, ...s.logs.filter((l) => l.date !== date)].slice(
            0,
            180,
          ),
        };
      });
    },
    [],
  );

  const addWeight = useCallback((entry: WeightEntry) => {
    setState((s) => ({
      ...s,
      weightLog: [entry, ...s.weightLog.filter((w) => w.date !== entry.date)].slice(
        0,
        120,
      ),
      latestMetrics: s.latestMetrics
        ? {
            ...s.latestMetrics,
            weightKg: entry.weightKg,
            bodyFatPct: entry.bodyFatPct ?? s.latestMetrics.bodyFatPct,
            measuredAt: entry.date,
          }
        : s.latestMetrics,
    }));
  }, []);

  const setSettings = useCallback((settings: Partial<Settings>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...settings },
    }));
  }, []);

  const exportBackup = useCallback(() => exportStateJson(state), [state]);

  const importBackup = useCallback((json: string) => {
    setState(importStateJson(json));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState());
  }, []);

  const todayLog = useMemo(
    () => state.logs.find((l) => l.date === todayKey()),
    [state.logs],
  );

  const value: PtStore = {
    ...state,
    hydrated,
    setProfile,
    setMetrics,
    bootstrap,
    regeneratePlan,
    updateLog,
    addWeight,
    setSettings,
    exportBackup,
    importBackup,
    resetAll,
    todayLog,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePtStore(): PtStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePtStore must be used within PtStoreProvider");
  return ctx;
}
