"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconSparkles } from "@/components/icons";
import { usePtStore } from "@/hooks/usePtStore";
import { todayKey } from "@/lib/calc";
import { emptyMedical, requiresClinicianClearance } from "@/lib/medical";
import type {
  ActivityLevel,
  Goal,
  JointZone,
  MedicalCondition,
  MedicalFlags,
  Profile,
  Sex,
} from "@/lib/types";
import {
  emptyFemaleCycle,
  emptyLifeContext,
  emptyMaleReadiness,
  SCHEDULE_LABELS,
  VENUE_LABELS,
} from "@/lib/context";
import { CONDITION_LABELS, GOAL_LABELS, JOINT_LABELS } from "@/lib/types";
import type { LifeContext } from "@/lib/types";

const GOALS = (Object.keys(GOAL_LABELS) as Goal[]).map((id) => ({
  id,
  label: GOAL_LABELS[id],
}));

const SESSION_MINS = [30, 45, 60, 75, 90];

const CONDITIONS = Object.keys(CONDITION_LABELS) as MedicalCondition[];
const JOINTS = Object.keys(JOINT_LABELS) as JointZone[];

export default function OnboardingPage() {
  const router = useRouter();
  const store = usePtStore();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("Tôi");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>("male");
  const [goal, setGoal] = useState<Goal>("recomp");
  const [goalNote, setGoalNote] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [daysPerWeek, setDays] = useState(4);
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [equipment, setEquipment] = useState("Phòng gym / tạ đơn");
  const [life, setLife] = useState<LifeContext>(emptyLifeContext());
  const [femaleCycle, setFemaleCycle] = useState(emptyFemaleCycle());
  const [maleReadiness, setMaleReadiness] = useState(emptyMaleReadiness());
  const [medical, setMedical] = useState<MedicalFlags>(emptyMedical());

  const [weightKg, setWeight] = useState(70);
  const [heightCm, setHeight] = useState(170);
  const [bodyFatPct, setBf] = useState<number | "">("");
  const [muscleKg, setMuscle] = useState<number | "">("");

  const needsClearance = requiresClinicianClearance(medical);

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0 && age >= 12 && age <= 90;
    if (step === 1) return weightKg > 30 && heightCm > 100;
    if (step === 2) {
      if (!medical.disclaimerAccepted) return false;
      if (medical.hasRedFlags && !medical.redFlagNotes.trim()) return false;
      if (needsClearance && !medical.clinicianCleared) return false;
      return true;
    }
    return true;
  }, [step, name, age, weightKg, heightCm, medical, needsClearance]);

  function toggleCondition(c: MedicalCondition) {
    setMedical((m) => ({
      ...m,
      conditions: m.conditions.includes(c)
        ? m.conditions.filter((x) => x !== c)
        : [...m.conditions, c],
    }));
  }

  function toggleJoint(j: JointZone) {
    setMedical((m) => ({
      ...m,
      jointZones: m.jointZones.includes(j)
        ? m.jointZones.filter((x) => x !== j)
        : [...m.jointZones, j],
    }));
  }

  function finish() {
    const now = new Date().toISOString();
    const profile: Profile = {
      name: name.trim(),
      age,
      sex,
      goal,
      goalNote: goalNote.trim(),
      activity,
      daysPerWeek,
      sessionsPerDay,
      sessionMinutes,
      availableEquipment: equipment,
      medical,
      life,
      femaleCycle,
      maleReadiness,
      createdAt: now,
      updatedAt: now,
    };
    store.bootstrap(profile, {
      weightKg,
      heightCm,
      bodyFatPct: bodyFatPct === "" ? undefined : Number(bodyFatPct),
      skeletalMuscleKg: muscleKg === "" ? undefined : Number(muscleKg),
      measuredAt: todayKey(),
    });
    router.replace("/today");
  }

  const weeklyMins = daysPerWeek * sessionsPerDay * sessionMinutes;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-4 rise">
      <div>
        <p className="chip mb-3">Setup · cá nhân</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight text-[var(--ink)]">
          PT Desk
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Khai mục tiêu + lịch tập rõ ràng → plan có ảnh, sơ đồ cơ và clip
          YouTube form. Dữ liệu chỉ trên máy bạn.
        </p>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? "bg-[var(--accent)]" : "bg-[var(--line)]"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Hồ sơ</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field sm:col-span-2">
              <label>Tên gọi</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Tuổi</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Giới tính (tính BMR)</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="field sm:col-span-2">
              <label>Mục tiêu chính</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      goal === g.id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field sm:col-span-2">
              <label>Muốn đạt gì cụ thể? (tuỳ chọn)</label>
              <input
                value={goalNote}
                onChange={(e) => setGoalNote(e.target.value)}
                placeholder="VD: giảm 4kg / tăng bench / chạy 5km không mệt"
              />
            </div>
            <div className="field">
              <label>Mức vận động nền</label>
              <select
                value={activity}
                onChange={(e) =>
                  setActivity(e.target.value as ActivityLevel)
                }
              >
                <option value="sedentary">Ít vận động</option>
                <option value="light">Nhẹ</option>
                <option value="moderate">Trung bình</option>
                <option value="active">Năng động</option>
                <option value="very_active">Rất năng động</option>
              </select>
            </div>
            <div className="field">
              <label>Ngày tập / tuần</label>
              <input
                type="number"
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Số buổi / ngày tập</label>
              <div className="flex gap-2">
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSessionsPerDay(n)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
                      sessionsPerDay === n
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {n} buổi
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Thời lượng / buổi</label>
              <div className="flex flex-wrap gap-2">
                {SESSION_MINS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSessionMinutes(m)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      sessionMinutes === m
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {m}p
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--sand)] px-3 py-2 text-sm">
              <span className="font-semibold text-[var(--ink)]">
                ~{weeklyMins} phút / tuần
              </span>
              <span className="text-[var(--muted)]">
                {" "}
                · {daysPerWeek} ngày × {sessionsPerDay} buổi × {sessionMinutes}
                phút
              </span>
            </div>
            <div className="field sm:col-span-2">
              <label>Thiết bị sẵn có</label>
              <input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Bodyweight / tạ đơn / phòng gym…"
              />
            </div>

            <div className="field sm:col-span-2">
              <label>Hoàn cảnh sống</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SCHEDULE_LABELS) as LifeContext["scheduleType"][]).map(
                  (id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLife((l) => ({ ...l, scheduleType: id }))}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        life.scheduleType === id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      {SCHEDULE_LABELS[id]}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="field sm:col-span-2">
              <label>Nơi tập chính</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(VENUE_LABELS) as LifeContext["venue"][]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLife((l) => ({ ...l, venue: id }))}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      life.venue === id
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)] bg-white"
                    }`}
                  >
                    {VENUE_LABELS[id]}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Ngân sách ăn</label>
              <select
                value={life.foodBudget}
                onChange={(e) =>
                  setLife((l) => ({
                    ...l,
                    foodBudget: e.target.value as LifeContext["foodBudget"],
                  }))
                }
              >
                <option value="low">Eo hẹp</option>
                <option value="mid">Trung bình</option>
                <option value="flexible">Linh hoạt</option>
              </select>
            </div>
            <div className="field">
              <label>Kiểu ăn</label>
              <select
                value={life.dietPattern}
                onChange={(e) =>
                  setLife((l) => ({
                    ...l,
                    dietPattern: e.target.value as LifeContext["dietPattern"],
                  }))
                }
              >
                <option value="none">Không đặc biệt</option>
                <option value="vegetarian">Chay trứng sữa</option>
                <option value="vegan">Thuần chay</option>
                <option value="lactose_free">Hạn chế sữa</option>
                <option value="gluten_free">Hạn chế gluten</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={life.travelsOften}
                  onChange={(e) =>
                    setLife((l) => ({ ...l, travelsOften: e.target.checked }))
                  }
                />
                Hay đi công tác
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={life.examOrDeadlineMode}
                  onChange={(e) =>
                    setLife((l) => ({
                      ...l,
                      examOrDeadlineMode: e.target.checked,
                    }))
                  }
                />
                Mùa thi / deadline
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={life.physicalJob}
                  onChange={(e) =>
                    setLife((l) => ({ ...l, physicalJob: e.target.checked }))
                  }
                />
                Việc chân tay
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={life.heatHumidityAware}
                  onChange={(e) =>
                    setLife((l) => ({
                      ...l,
                      heatHumidityAware: e.target.checked,
                    }))
                  }
                />
                Nóng ẩm VN
              </label>
            </div>

            {sex === "female" && (
              <div className="sm:col-span-2 space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--sand)] p-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={femaleCycle.cycleTrackingEnabled}
                    onChange={(e) =>
                      setFemaleCycle((f) => ({
                        ...f,
                        cycleTrackingEnabled: e.target.checked,
                      }))
                    }
                  />
                  Theo dõi chu kỳ / triệu chứng (tuỳ chọn)
                </label>
                {femaleCycle.cycleTrackingEnabled && (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="field">
                        <label>Độ dài chu kỳ TB</label>
                        <input
                          type="number"
                          min={21}
                          max={40}
                          value={femaleCycle.avgCycleLength}
                          onChange={(e) =>
                            setFemaleCycle((f) => ({
                              ...f,
                              avgCycleLength: Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="field">
                        <label>Ngày đầu kỳ gần nhất</label>
                        <input
                          type="date"
                          value={femaleCycle.lastPeriodStart}
                          onChange={(e) =>
                            setFemaleCycle((f) => ({
                              ...f,
                              lastPeriodStart: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={femaleCycle.irregularOrAbsentFlag}
                        onChange={(e) =>
                          setFemaleCycle((f) => ({
                            ...f,
                            irregularOrAbsentFlag: e.target.checked,
                          }))
                        }
                      />
                      Chu kỳ rất không đều / mất kinh kéo dài (gợi ý khám)
                    </label>
                    <p className="text-[10px] text-[var(--muted)]">
                      Điều chỉnh theo triệu chứng — không ép volume theo pha
                      hormone.
                    </p>
                  </>
                )}
              </div>
            )}

            {sex === "male" && (
              <div className="sm:col-span-2 space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--sand)] p-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={maleReadiness.readinessTrackingEnabled}
                    onChange={(e) =>
                      setMaleReadiness((m) => ({
                        ...m,
                        readinessTrackingEnabled: e.target.checked,
                      }))
                    }
                  />
                  Theo dõi readiness / phục hồi (tuỳ chọn)
                </label>
                {maleReadiness.readinessTrackingEnabled && (
                  <>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={maleReadiness.prioritizeRecovery}
                        onChange={(e) =>
                          setMaleReadiness((m) => ({
                            ...m,
                            prioritizeRecovery: e.target.checked,
                          }))
                        }
                      />
                      Ưu tiên ngủ & phục hồi hơn volume
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={maleReadiness.chronicFatigueFlag}
                        onChange={(e) =>
                          setMaleReadiness((m) => ({
                            ...m,
                            chronicFatigueFlag: e.target.checked,
                          }))
                        }
                      />
                      Hay mệt / ăn thiếu kéo dài
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">InBody / số đo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field">
              <label>Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Chiều cao (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>% mỡ (tuỳ chọn)</label>
              <input
                type="number"
                step="0.1"
                value={bodyFatPct}
                onChange={(e) =>
                  setBf(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
            <div className="field">
              <label>Cơ xương (kg, tuỳ chọn)</label>
              <input
                type="number"
                step="0.1"
                value={muscleKg}
                onChange={(e) =>
                  setMuscle(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Ràng buộc y tế (bắt buộc rõ)</h2>
          <p className="text-sm text-[var(--muted)]">
            Giống NTC / Move With Us: khai báo để lọc bài tập và điều chỉnh ăn.
            Không thay thế khám bác sĩ.
          </p>

          <div className="rounded-xl border border-[var(--danger)]/30 bg-[#fde8e4] p-3 space-y-2">
            <label className="flex items-start gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="mt-1"
                checked={medical.hasRedFlags}
                onChange={(e) =>
                  setMedical((m) => ({ ...m, hasRedFlags: e.target.checked }))
                }
              />
              Tôi đang có dấu hiệu cần thận trọng: đau ngực, khó thở bất thường,
              chóng mặt khi gắng sức, đau dữ dội không rõ nguyên nhân…
            </label>
            {medical.hasRedFlags && (
              <div className="field">
                <label>Mô tả ngắn (bắt buộc)</label>
                <textarea
                  rows={2}
                  value={medical.redFlagNotes}
                  onChange={(e) =>
                    setMedical((m) => ({
                      ...m,
                      redFlagNotes: e.target.value,
                    }))
                  }
                  placeholder="VD: tức ngực khi leo cầu thang"
                />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Bệnh nền / tình trạng</p>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => {
                const on = medical.conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={`rounded-lg border px-2.5 py-1.5 text-left text-xs sm:text-sm ${
                      on
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    {CONDITION_LABELS[c]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              Khớp / vùng cần bảo vệ (lọc bài tập)
            </p>
            <div className="flex flex-wrap gap-2">
              {JOINTS.map((j) => {
                const on = medical.jointZones.includes(j);
                return (
                  <button
                    key={j}
                    type="button"
                    onClick={() => toggleJoint(j)}
                    className={`rounded-lg border px-2.5 py-1.5 text-sm ${
                      on
                        ? "border-[var(--warn)] bg-[#fff6e8]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    {JOINT_LABELS[j]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="field">
              <label>Chi tiết khớp</label>
              <input
                value={medical.jointNotes}
                onChange={(e) =>
                  setMedical((m) => ({ ...m, jointNotes: e.target.value }))
                }
                placeholder="VD: ACL gối trái 2024"
              />
            </div>
            <div className="field">
              <label>Chi tiết tim mạch / huyết áp</label>
              <input
                value={medical.cardioNotes}
                onChange={(e) =>
                  setMedical((m) => ({ ...m, cardioNotes: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Thuốc đang dùng (tuỳ chọn)</label>
              <input
                value={medical.medicationNotes}
                onChange={(e) =>
                  setMedical((m) => ({
                    ...m,
                    medicationNotes: e.target.value,
                  }))
                }
              />
            </div>
            <div className="field">
              <label>Ghi chú khác</label>
              <textarea
                rows={2}
                value={medical.otherNotes}
                onChange={(e) =>
                  setMedical((m) => ({ ...m, otherNotes: e.target.value }))
                }
              />
            </div>
          </div>

          {needsClearance && (
            <label className="flex items-start gap-2 rounded-xl border border-[var(--warn)]/40 bg-[#fff6e8] p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={medical.clinicianCleared}
                onChange={(e) =>
                  setMedical((m) => ({
                    ...m,
                    clinicianCleared: e.target.checked,
                  }))
                }
              />
              Tôi xác nhận đã được bác sĩ / PT chuyên nghiệp cho phép tập với
              các điều kiện trên (hoặc chấp nhận plan cường độ thấp thận trọng).
            </label>
          )}

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={medical.disclaimerAccepted}
              onChange={(e) =>
                setMedical((m) => ({
                  ...m,
                  disclaimerAccepted: e.target.checked,
                }))
              }
            />
            Tôi hiểu PT Desk chỉ là công cụ lập kế hoạch cá nhân, không phải
            chẩn đoán / điều trị y tế.
          </label>
        </section>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Quay lại
        </button>
        {step < 2 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Tiếp <IconArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canNext}
            onClick={finish}
          >
            <IconSparkles size={16} /> Tạo lộ trình
          </button>
        )}
      </div>
    </div>
  );
}
