"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconDownload, IconTrash, IconUpload } from "@/components/icons";
import { usePtStore } from "@/hooks/usePtStore";

export default function SettingsPage() {
  const router = useRouter();
  const {
    hydrated,
    profile,
    settings,
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
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Cài đặt
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Dữ liệu lưu localStorage trên máy bạn (kiểu Study Desk)
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-semibold">Groq API (tuỳ chọn · Phase sau)</h2>
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
        <h2 className="font-semibold">Lộ trình</h2>
        <button type="button" className="btn btn-ghost" onClick={regeneratePlan}>
          Sinh lại plan từ hồ sơ hiện tại
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push("/onboarding")}
        >
          Làm lại onboarding
        </button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Backup</h2>
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
        <h2 className="font-semibold text-[var(--danger)]">Nguy hiểm</h2>
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
