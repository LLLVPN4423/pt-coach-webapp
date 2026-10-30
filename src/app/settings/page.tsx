"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconDownload, IconTrash, IconUpload } from "@/components/icons";
import { usePtStore } from "@/hooks/usePtStore";
import type { TrainingStyle } from "@/lib/types";
import {
  TRAINING_STYLE_BLURBS,
  TRAINING_STYLE_LABELS,
  TRAINING_STYLES,
} from "@/lib/training-styles";

export default function SettingsPage() {
  const router = useRouter();
  const {
    hydrated,
    profile,
    settings,
    setProfile,
    setSettings,
    exportBackup,
    importBackup,
    resetAll,
    regeneratePlan,
  } = usePtStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  function downloadBackup() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pt-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Đã tải backup JSON.");
  }

  function onImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackup(String(reader.result));
        setMsg("Đã khôi phục backup.");
        router.replace("/today");
      } catch {
        setMsg("File backup không hợp lệ.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-sub">
          Dữ liệu lưu localStorage trên máy bạn (kiểu Study Desk)
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="section-title">Groq API (tuỳ chọn · Phase sau)</h2>
        <p className="text-sm text-[var(--muted)]">
          Hiện plan được sinh bằng công thức TDEE + rule. Key chỉ lưu local —
          dùng khi bật AI gen sau này.
        </p>
        <div className="field">
          <label>Groq API key</label>
          <input
            type="password"
            placeholder="gsk_…"
            value={settings.groqApiKey ?? ""}
            onChange={(e) => setSettings({ groqApiKey: e.target.value })}
          />
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Lịch tập & mục tiêu</h2>
        {profile && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field sm:col-span-2">
              <label>Phong cách tập</label>
              <select
                value={profile.trainingStyle || "balanced"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    trainingStyle: e.target.value as TrainingStyle,
                    updatedAt: new Date().toISOString(),
                  })
                }
              >
                {TRAINING_STYLES.map((id) => (
                  <option key={id} value={id}>
                    {TRAINING_STYLE_LABELS[id]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {
                  TRAINING_STYLE_BLURBS[
                    (profile.trainingStyle || "balanced") as TrainingStyle
                  ]
                }
              </p>
            </div>
            <div className="field">
              <label>Ngày / tuần</label>
              <input
                type="number"
                min={1}
                max={7}
                value={profile.daysPerWeek}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    daysPerWeek: Number(e.target.value),
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
            </div>
            <div className="field">
              <label>Buổi / ngày</label>
              <input
                type="number"
                min={1}
                max={2}
                value={profile.sessionsPerDay ?? 1}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    sessionsPerDay: Number(e.target.value),
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
            </div>
            <div className="field">
              <label>Phút / buổi</label>
              <input
                type="number"
                min={20}
                max={120}
                step={5}
                value={profile.sessionMinutes ?? 45}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    sessionMinutes: Number(e.target.value),
                    updatedAt: new Date().toISOString(),
                  })
                }
              />
            </div>
            <div className="field">
              <label>Ghi chú mục tiêu</label>
              <input
                value={profile.goalNote ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    goalNote: e.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder="VD: giảm eo, tăng squat…"
              />
            </div>
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            regeneratePlan();
            setMsg("Đã sinh lại plan theo lịch mới.");
          }}
        >
          Áp dụng & sinh lại plan
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push("/onboarding")}
        >
          Làm lại onboarding đầy đủ
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">Backup</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={downloadBackup}>
            <IconDownload size={16} /> Export JSON
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fileRef.current?.click()}
          >
            <IconUpload size={16} /> Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
            }}
          />
        </div>
        {msg && <p className="text-sm text-[var(--accent)]">{msg}</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="section-title text-[var(--danger)]">Nguy hiểm</h2>
        <button
          type="button"
          className="btn btn-ghost text-[var(--danger)]"
          onClick={() => {
            if (confirm("Xóa toàn bộ dữ liệu PT Desk trên máy này?")) {
              resetAll();
              router.replace("/onboarding");
            }
          }}
        >
          <IconTrash size={16} /> Xóa hết dữ liệu local
        </button>
      </section>
    </div>
  );
}
