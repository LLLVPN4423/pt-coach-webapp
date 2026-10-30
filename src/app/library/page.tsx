"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconDumbbell, IconUtensils } from "@/components/icons";
import { usePtStore } from "@/hooks/usePtStore";
import { EXERCISES, searchExercises } from "@/lib/exercises";
import { FOODS, fetchOffProduct } from "@/lib/foods";

type Tab = "exercises" | "foods" | "off";

export default function LibraryPage() {
  const router = useRouter();
  const { hydrated, profile } = usePtStore();
  const [tab, setTab] = useState<Tab>("exercises");
  const [q, setQ] = useState("");
  const [barcode, setBarcode] = useState("");
  const [offLoading, setOffLoading] = useState(false);
  const [offResult, setOffResult] = useState<Awaited<
    ReturnType<typeof fetchOffProduct>
  > | null>(null);
  const [offErr, setOffErr] = useState("");

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  const exercises = useMemo(() => searchExercises(q, 40), [q]);
  const foods = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FOODS.slice(0, 40);
    return FOODS.filter(
      (f) =>
        f.name.toLowerCase().includes(s) ||
        f.nameEn.toLowerCase().includes(s) ||
        f.group.includes(s) ||
        f.tags.some((t) => t.includes(s)),
    ).slice(0, 40);
  }, [q]);

  async function lookupOff() {
    setOffErr("");
    setOffResult(null);
    setOffLoading(true);
    try {
      const r = await fetchOffProduct(barcode);
      if (!r) setOffErr("Không tìm thấy mã này trên Open Food Facts.");
      else setOffResult(r);
    } catch {
      setOffErr("Lỗi mạng khi gọi Open Food Facts.");
    } finally {
      setOffLoading(false);
    }
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="chip">Open data</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
          Thư viện
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          ~{EXERCISES.length} bài tập (free-exercise-db) · {FOODS.length} thực
          phẩm · tra cứu Open Food Facts
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["exercises", "Bài tập", IconDumbbell],
            ["foods", "Thực phẩm", IconUtensils],
            ["off", "Barcode OFF", IconUtensils],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            className={`btn ${tab === id ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab !== "off" && (
        <input
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          placeholder={
            tab === "exercises"
              ? "Tìm bài tập (tên, cơ, dụng cụ)…"
              : "Tìm thực phẩm (tên, nhóm)…"
          }
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}

      {tab === "exercises" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {exercises.map((e) => (
            <article
              key={e.id}
              className="flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.imageUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover bg-[var(--sand)]"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{e.name}</p>
                <p className="text-xs text-[var(--muted)]">
                  {e.muscle} · {e.equipment} · {e.level}
                </p>
                <a
                  href={e.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-[var(--accent)]"
                >
                  Clip form →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "foods" && (
        <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-[var(--sand)] text-xs text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Tên</th>
                <th className="px-3 py-2 font-medium">Nhóm</th>
                <th className="px-3 py-2 font-medium">Khẩu phần</th>
                <th className="px-3 py-2 font-medium">kcal</th>
                <th className="px-3 py-2 font-medium">P</th>
                <th className="px-3 py-2 font-medium">C</th>
                <th className="px-3 py-2 font-medium">F</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-2">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-[var(--muted)]">{f.nameEn}</p>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">{f.group}</td>
                  <td className="px-3 py-2">{f.servingG}g</td>
                  <td className="px-3 py-2">{f.kcal}</td>
                  <td className="px-3 py-2">{f.protein}</td>
                  <td className="px-3 py-2">{f.carbs}</td>
                  <td className="px-3 py-2">{f.fat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "off" && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Open Food Facts (API miễn phí)</h2>
          <p className="text-sm text-[var(--muted)]">
            Nhập mã vạch sản phẩm để xem kcal / macro / 100g. Dữ liệu cộng đồng —
            kiểm tra lại nhãn khi cần chính xác.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[200px] flex-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Mã vạch (VD: 3017620422003)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={offLoading || barcode.replace(/\D/g, "").length < 8}
              onClick={lookupOff}
            >
              {offLoading ? "Đang tra…" : "Tra cứu"}
            </button>
          </div>
          {offErr && <p className="text-sm text-[var(--danger)]">{offErr}</p>}
          {offResult && (
            <div className="flex gap-3 rounded-xl bg-[var(--sand)] p-3">
              {offResult.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offResult.image}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{offResult.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  /100g · kcal {offResult.kcal ?? "—"} · P{" "}
                  {offResult.protein ?? "—"}g · C {offResult.carbs ?? "—"}g · F{" "}
                  {offResult.fat ?? "—"}g
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
