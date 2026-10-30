"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconDumbbell, IconUtensils } from "@/components/icons";
import { PageGate } from "@/components/PageGate";
import { usePtStore } from "@/hooks/usePtStore";
import {
  EQUIPMENT_FILTERS,
  EXERCISES,
  MUSCLE_FILTERS,
  searchExercises,
} from "@/lib/exercises";
import { FOODS, fetchOffProduct } from "@/lib/foods";

type Tab = "exercises" | "foods" | "off";

export default function LibraryPage() {
  const router = useRouter();
  const { hydrated, profile } = usePtStore();
  const [tab, setTab] = useState<Tab>("exercises");
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [foodGroup, setFoodGroup] = useState("all");
  const [limit, setLimit] = useState(48);
  const [barcode, setBarcode] = useState("");
  const [offLoading, setOffLoading] = useState(false);
  const [offResult, setOffResult] = useState<Awaited<
    ReturnType<typeof fetchOffProduct>
  > | null>(null);
  const [offErr, setOffErr] = useState("");

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  const exercises = useMemo(
    () => searchExercises(q, limit, { muscle, equipment }),
    [q, limit, muscle, equipment],
  );
  const foodGroups = useMemo(
    () => ["all", ...Array.from(new Set(FOODS.map((f) => f.group)))],
    [],
  );
  const foods = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (foodGroup !== "all" && f.group !== foodGroup) return false;
      if (!s) return true;
      return (
        f.name.toLowerCase().includes(s) ||
        f.nameEn.toLowerCase().includes(s) ||
        f.tags.some((t) => t.includes(s))
      );
    }).slice(0, limit);
  }, [q, foodGroup, limit]);

  if (!hydrated || !profile) return <PageGate ready={false} />;

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="chip">Open data · 3D GIF</p>
        <h1 className="page-title mt-2">Thư viện</h1>
        <p className="page-sub">
          {EXERCISES.length} bài tập (Gym Visual 3D GIF) · {FOODS.length} thực
          phẩm · Open Food Facts
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
            onClick={() => {
              setTab(id);
              setLimit(48);
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab !== "off" && (
        <>
          <input
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            placeholder={
              tab === "exercises" ? "Tìm bài tập…" : "Tìm thực phẩm…"
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {tab === "exercises" && (
            <div className="flex flex-wrap gap-2">
              {MUSCLE_FILTERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    muscle === m
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--elevated)]"
                  }`}
                  onClick={() => setMuscle(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          {tab === "exercises" && (
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_FILTERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    equipment === m
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--elevated)]"
                  }`}
                  onClick={() => setEquipment(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
          {tab === "foods" && (
            <div className="flex flex-wrap gap-2">
              {foodGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    foodGroup === g
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-[var(--elevated)]"
                  }`}
                  onClick={() => setFoodGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "exercises" && (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((e) => (
              <article
                key={e.id}
                className="flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--elevated)]/80 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.gifUrl || e.imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-xl bg-[var(--elevated)] object-contain"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">{e.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {e.muscle} · {e.equipment}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    {(e.primaryMuscles || []).slice(0, 2).join(", ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
          {exercises.length >= limit && (
            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => setLimit((n) => n + 48)}
            >
              Xem thêm (+48)
            </button>
          )}
        </>
      )}

      {tab === "foods" && (
        <>
          <div className="table-wrap">
            <table className="min-w-[520px]">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Nhóm</th>
                  <th>kcal</th>
                  <th>P</th>
                  <th>C</th>
                  <th>F</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium">{f.name}</td>
                    <td className="text-[var(--muted)]">{f.group}</td>
                    <td>{f.kcal}</td>
                    <td>{f.protein}</td>
                    <td>{f.carbs}</td>
                    <td>{f.fat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {foods.length >= limit && (
            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => setLimit((n) => n + 48)}
            >
              Xem thêm
            </button>
          )}
        </>
      )}

      {tab === "off" && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Open Food Facts</h2>
          <div className="flex flex-wrap gap-2">
            <input
              className="min-w-[200px] flex-1 rounded-xl border border-[var(--line)] bg-[var(--elevated)] px-3 py-2.5 text-sm"
              placeholder="Mã vạch"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={offLoading}
              onClick={async () => {
                setOffErr("");
                setOffResult(null);
                setOffLoading(true);
                try {
                  const r = await fetchOffProduct(barcode);
                  if (!r) setOffErr("Không tìm thấy.");
                  else setOffResult(r);
                } catch {
                  setOffErr("Lỗi mạng.");
                } finally {
                  setOffLoading(false);
                }
              }}
            >
              Tra cứu
            </button>
          </div>
          {offErr && <p className="text-sm text-[var(--danger)]">{offErr}</p>}
          {offResult && (
            <p className="text-sm">
              <span className="font-semibold">{offResult.name}</span> — kcal{" "}
              {offResult.kcal ?? "—"} /100g
            </p>
          )}
        </section>
      )}

      <p className="text-[10px] text-[var(--muted)]">
        Animation © Gym visual (qua exercises-dataset) · chỉ dùng cá nhân /
        educational · không thay thế tư vấn y tế
      </p>
    </div>
  );
}
