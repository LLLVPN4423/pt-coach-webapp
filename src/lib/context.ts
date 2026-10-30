import type { LifeContext, Profile, Sex } from "./types";

export function emptyLifeContext(): LifeContext {
  return {
    scheduleType: "office_9_5",
    preferredSlots: ["evening"],
    maxSessionMin: undefined,
    venue: "gym",
    equipmentTags: [],
    travelsOften: false,
    examOrDeadlineMode: false,
    physicalJob: false,
    typicalSleepHours: 7,
    baselineStress: 2,
    foodBudget: "mid",
    dietPattern: "none",
    eatingWindow: "normal",
    heatHumidityAware: true,
    caregivingLoad: "none",
    temporaryFlags: [],
    contextNote: "",
  };
}

export function emptyFemaleCycle() {
  return {
    cycleTrackingEnabled: false,
    avgCycleLength: 28,
    lastPeriodStart: "",
    usesHormonalContraceptive: false,
    commonSymptoms: [] as string[],
    irregularOrAbsentFlag: false,
  };
}

export function emptyMaleReadiness() {
  return {
    readinessTrackingEnabled: false,
    prioritizeRecovery: false,
    chronicFatigueFlag: false,
  };
}

export const SCHEDULE_LABELS: Record<LifeContext["scheduleType"], string> = {
  office_9_5: "Văn phòng ~9–5",
  shift: "Ca kíp / giờ lệch",
  student: "Sinh viên / học",
  freelance: "Freelance / linh hoạt",
  caregiver: "Chăm sóc gia đình",
};

export const VENUE_LABELS: Record<LifeContext["venue"], string> = {
  gym: "Phòng gym",
  home: "Tập nhà",
  outdoor: "Ngoài trời",
  hotel_travel: "Khách sạn / công tác",
};

export const FEMALE_SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Đau bụng kinh",
  fatigue: "Mệt",
  bloating: "Đầy hơi",
  headache: "Đau đầu",
  mood: "Thay đổi tâm trạng",
  back_pain: "Đau lưng",
  heavy_flow: "Ra nhiều",
};

export const CONTEXT_DAY_TAGS: { id: string; label: string }[] = [
  { id: "sick", label: "Ốm / phục hồi" },
  { id: "travel", label: "Công tác / đi lại" },
  { id: "exam", label: "Thi / deadline" },
  { id: "no_time", label: "Quá bận" },
  { id: "heat_outdoor", label: "Nóng ngoài trời" },
  { id: "poor_sleep", label: "Ngủ kém" },
  { id: "high_stress", label: "Stress cao" },
];

/** Estimate cycle day from last period start (reference only). */
export function estimateCycleDay(
  lastPeriodStart: string,
  avgLen: number,
  today = new Date(),
): number | null {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diff < 0) return null;
  const len = Math.max(21, Math.min(40, avgLen || 28));
  return (diff % len) + 1;
}

export function sexAwareNotes(profile: Profile): string[] {
  const notes: string[] = [];
  const sex: Sex = profile.sex;
  if (sex === "female" && profile.femaleCycle?.cycleTrackingEnabled) {
    notes.push(
      "Nữ · theo dõi triệu chứng (không ép volume theo pha chu kỳ). Ngày đau/mệt → giảm tải hoặc mobility.",
    );
    if (profile.femaleCycle.irregularOrAbsentFlag) {
      notes.push(
        "Chu kỳ rất không đều / mất kinh kéo dài — nên trao đổi bác sĩ; plan giữ cường độ thận trọng.",
      );
    }
    notes.push(
      "Gần/trong kỳ kinh: ưu tiên đạm + sắt từ thực phẩm, đủ nước; không siết calo gắt.",
    );
  }
  if (sex === "male" && profile.maleReadiness?.readinessTrackingEnabled) {
    notes.push(
      "Nam · readiness: ngủ / stress / DOMS quyết định deload ngày — không phải “chu kỳ hormone” giả.",
    );
    if (profile.maleReadiness.chronicFatigueFlag) {
      notes.push(
        "Mệt mãn tính / ăn thiếu kéo dài → ưu tiên ngủ + đủ năng lượng trước khi tăng volume.",
      );
    }
  }
  return notes;
}

export function lifeContextNotes(ctx: LifeContext): string[] {
  const notes: string[] = [];
  notes.push(`Hoàn cảnh: ${SCHEDULE_LABELS[ctx.scheduleType]} · ${VENUE_LABELS[ctx.venue]}.`);
  if (ctx.examOrDeadlineMode) {
    notes.push("Chế độ thi/deadline: rút ngắn buổi, ưu tiên consistency hơn PR.");
  }
  if (ctx.caregivingLoad === "heavy") {
    notes.push("Chăm sóc nặng: giữ ít ngày/tuần, buổi ngắn, dễ bỏ lỡ → vẫn tính tiến bộ.");
  }
  if (ctx.travelsOften) {
    notes.push("Hay đi công tác: có ngày bodyweight / khách sạn trong tuần.");
  }
  if (ctx.physicalJob) {
    notes.push("Việc chân tay: giảm volume chân/lưng, tăng phục hồi.");
  }
  if (ctx.heatHumidityAware) {
    notes.push("Nóng ẩm: tập giờ mát, uống đủ nước; tránh HIIT ngoài trời giữa trưa.");
  }
  if (ctx.foodBudget === "low") {
    notes.push("Ngân sách ăn eo hẹp: ưu tiên món VN phổ thông / tag rẻ.");
  }
  if (ctx.dietPattern !== "none") {
    notes.push(`Kiểu ăn: ${ctx.dietPattern} — meal plan đã lọc tương ứng.`);
  }
  if (ctx.temporaryFlags?.length) {
    notes.push(`Tạm thời: ${ctx.temporaryFlags.join(", ")}.`);
  }
  if (ctx.contextNote?.trim()) notes.push(ctx.contextNote.trim());
  return notes;
}

export function effectiveSessionMinutes(profile: Profile): number {
  const base = profile.sessionMinutes || 45;
  const cap = profile.life?.maxSessionMin;
  let m = cap ? Math.min(base, cap) : base;
  if (profile.life?.examOrDeadlineMode) m = Math.min(m, 30);
  if (profile.life?.caregivingLoad === "heavy") m = Math.min(m, 35);
  if (profile.life?.temporaryFlags?.includes("sick_recovering")) m = Math.min(m, 20);
  return Math.max(15, m);
}

export function shouldDeloadToday(opts: {
  contextTags?: string[];
  wantsDeload?: boolean;
  sleepHours?: number;
  energy1to5?: number;
  soreness1to5?: number;
  stress1to5?: number;
  bleeding?: boolean;
  symptoms?: string[];
}): boolean {
  if (opts.wantsDeload) return true;
  const tags = opts.contextTags || [];
  if (tags.some((t) => ["sick", "travel", "exam", "no_time", "heat_outdoor", "poor_sleep", "high_stress"].includes(t)))
    return true;
  if ((opts.sleepHours ?? 99) < 5.5) return true;
  if ((opts.energy1to5 ?? 5) <= 2) return true;
  if ((opts.soreness1to5 ?? 0) >= 4) return true;
  if ((opts.stress1to5 ?? 0) >= 4) return true;
  if (opts.bleeding && (opts.symptoms?.length ?? 0) >= 2) return true;
  if ((opts.symptoms?.length ?? 0) >= 3) return true;
  return false;
}
