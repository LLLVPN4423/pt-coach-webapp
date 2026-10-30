import type { AgeBand, TrainingStyle } from "./types";

export interface DayTemplate {
  focus: string;
  muscles: string[];
}

export interface StyleRx {
  sets: number;
  reps: string;
  restSec: number;
  note: string;
  preferCompound?: boolean;
  preferIsolation?: boolean;
  volumeScale?: number;
}

export const TRAINING_STYLE_LABELS: Record<TrainingStyle, string> = {
  balanced: "Cân bằng (PPL / UL)",
  hypertrophy: "Đối kháng · Hypertrophy",
  strength: "Sức mạnh · Strength",
  to_failure: "Gần thất bại · Intensity",
  science: "Science-based (RIR)",
  gorilla: "Gorilla build · Upper mass",
  full_body: "Full body",
  athletic: "Athletic · Performance",
  bro_split: "Bro split (1 nhóm/ngày)",
  minimalist: "Minimalist · Big lifts",
};

export const TRAINING_STYLE_BLURBS: Record<TrainingStyle, string> = {
  balanced: "Push/Pull/Legs hoặc Upper/Lower — ổn định lâu dài.",
  hypertrophy: "Volume cơ bắp, máy + isolation, nghỉ vừa.",
  strength: "Compound nặng, rep thấp, nghỉ dài.",
  to_failure: "Ít bài hơn, đẩy gần failure / RIR 0–1 (có cue).",
  science: "Ưu tiên compound, progressive overload, RIR 1–3.",
  gorilla: "Ngực–lưng–tay dày, volume trên cao (kiểu mass).",
  full_body: "Toàn thân mỗi buổi — tần suất cao, volume/ngày vừa.",
  athletic: "Sức mạnh + conditioning / core / power nhẹ.",
  bro_split: "Mỗi ngày một nhóm chính — classic gym.",
  minimalist: "Ít bài compound lớn, hiệu quả khi ít thời gian.",
};

export const TRAINING_STYLES = Object.keys(
  TRAINING_STYLE_LABELS,
) as TrainingStyle[];

/** Phân bố ngày tập đều trong tuần (Mon=0 … Sun=6). */
export function distributeTrainDays(daysPerWeek: number): number[] {
  const n = Math.min(7, Math.max(1, Math.round(daysPerWeek)));
  if (n >= 7) return [0, 1, 2, 3, 4, 5, 6];

  const raw: number[] = [];
  for (let i = 0; i < n; i++) {
    raw.push(Math.round((i * 7) / n) % 7);
  }

  const used = new Set<number>();
  const fixed: number[] = [];
  for (const start of raw) {
    let d = start;
    let guard = 0;
    while (used.has(d) && guard < 7) {
      d = (d + 1) % 7;
      guard++;
    }
    used.add(d);
    fixed.push(d);
  }
  return fixed.sort((a, b) => a - b);
}

function clampDays(days: number, max: number) {
  return Math.min(days, max);
}

export function splitForStyle(
  style: TrainingStyle,
  days: number,
  band: AgeBand,
): DayTemplate[] {
  const d = clampDays(days, band === "senior" ? 5 : 6);

  const fullA: DayTemplate = {
    focus: "Full body A",
    muscles: ["legs", "chest", "back", "core"],
  };
  const fullB: DayTemplate = {
    focus: "Full body B",
    muscles: ["posterior", "shoulders", "arms", "core"],
  };
  const fullC: DayTemplate = {
    focus: "Full body C",
    muscles: ["legs", "back", "shoulders", "core"],
  };

  const ppl = [
    { focus: "Push", muscles: ["chest", "shoulders", "arms"] },
    { focus: "Pull", muscles: ["back", "arms", "core"] },
    { focus: "Legs", muscles: ["legs", "posterior", "core"] },
  ];
  const ul = [
    { focus: "Upper A", muscles: ["chest", "back", "shoulders", "arms"] },
    { focus: "Lower A", muscles: ["legs", "posterior", "core"] },
    { focus: "Upper B", muscles: ["back", "chest", "arms", "shoulders"] },
    { focus: "Lower B", muscles: ["posterior", "legs", "core"] },
  ];

  switch (style) {
    case "full_body":
      if (d <= 2) return [fullA, fullB].slice(0, d);
      if (d === 3) return [fullA, fullB, fullC];
      return [fullA, fullB, fullC, fullA, fullB, fullC].slice(0, d);

    case "minimalist":
      return [
        { focus: "Squat focus", muscles: ["legs", "core"] },
        { focus: "Press focus", muscles: ["chest", "shoulders", "arms"] },
        { focus: "Hinge / pull", muscles: ["posterior", "back", "core"] },
        { focus: "Full compound", muscles: ["legs", "back", "chest"] },
      ].slice(0, Math.max(2, d));

    case "strength":
      if (d <= 2) return [fullA, fullB].slice(0, d);
      if (d === 3)
        return [
          { focus: "Squat day", muscles: ["legs", "core"] },
          { focus: "Bench / press", muscles: ["chest", "shoulders", "arms"] },
          { focus: "Deadlift / pull", muscles: ["posterior", "back", "core"] },
        ];
      return [
        { focus: "Squat + accessories", muscles: ["legs", "core"] },
        { focus: "Bench + upper", muscles: ["chest", "shoulders", "arms"] },
        { focus: "Deadlift + posterior", muscles: ["posterior", "back"] },
        { focus: "Overhead + pull", muscles: ["shoulders", "back", "arms"] },
        { focus: "Weak point", muscles: ["legs", "chest", "core"] },
      ].slice(0, d);

    case "bro_split":
      return [
        { focus: "Chest", muscles: ["chest", "arms"] },
        { focus: "Back", muscles: ["back", "arms"] },
        { focus: "Legs", muscles: ["legs", "posterior"] },
        { focus: "Shoulders", muscles: ["shoulders", "arms"] },
        { focus: "Arms + core", muscles: ["arms", "core"] },
        { focus: "Upper pump", muscles: ["chest", "back", "shoulders"] },
      ].slice(0, Math.max(3, d));

    case "gorilla":
      return [
        { focus: "Chest thickness", muscles: ["chest", "shoulders", "arms"] },
        { focus: "Back width/thick", muscles: ["back", "arms", "posterior"] },
        { focus: "Legs base", muscles: ["legs", "posterior", "core"] },
        { focus: "Shoulders + arms", muscles: ["shoulders", "arms", "chest"] },
        { focus: "Pull + pump", muscles: ["back", "arms", "core"] },
        { focus: "Push volume", muscles: ["chest", "shoulders", "arms"] },
      ].slice(0, Math.max(3, d));

    case "athletic":
      return [
        { focus: "Lower power", muscles: ["legs", "posterior", "core"] },
        { focus: "Upper power", muscles: ["chest", "back", "shoulders"] },
        { focus: "Conditioning + core", muscles: ["cardio", "core", "full"] },
        { focus: "Full athletic", muscles: ["legs", "back", "core", "cardio"] },
        { focus: "Posterior + mobility", muscles: ["posterior", "core", "cardio"] },
      ].slice(0, Math.max(3, d));

    case "hypertrophy":
    case "to_failure":
    case "science":
      if (d <= 2) return [fullA, fullB].slice(0, d);
      if (d === 3) return ppl;
      if (d === 4) return ul;
      return [...ppl, ...ul.slice(0, 2)].slice(0, d);

    case "balanced":
    default:
      if (d <= 2) return [fullA, fullB].slice(0, d);
      if (d === 3)
        return [
          { focus: "Upper", muscles: ["chest", "back", "shoulders", "arms"] },
          { focus: "Lower", muscles: ["legs", "posterior", "core"] },
          { focus: "Full + cardio", muscles: ["full", "core", "cardio"] },
        ];
      if (d === 4) return ul;
      return [...ppl, { focus: "Upper pump", muscles: ["chest", "back", "shoulders"] }, { focus: "Posterior + core", muscles: ["posterior", "core", "cardio"] }].slice(0, d);
  }
}

export function stylePrescription(
  style: TrainingStyle,
  band: AgeBand,
  base: { sets: number; rest: number },
): StyleRx {
  const seniorSoft = band === "senior" || band === "teen";

  switch (style) {
    case "hypertrophy":
      return {
        sets: seniorSoft ? base.sets : Math.min(5, base.sets + 1),
        reps: "8–12",
        restSec: 60,
        note: "Hypertrophy: kiểm soát eccentric, gần failure ở set cuối.",
        preferIsolation: true,
        volumeScale: 1.1,
      };
    case "strength":
      return {
        sets: base.sets,
        reps: seniorSoft ? "5–8" : "3–6",
        restSec: 150,
        note: "Strength: compound nặng, nghỉ dài, form sạch.",
        preferCompound: true,
        volumeScale: 0.85,
      };
    case "to_failure":
      return {
        sets: Math.max(2, base.sets - (seniorSoft ? 0 : 0)),
        reps: "8–12 → gần failure",
        restSec: 75,
        note: "Intensity: RIR 0–1 set cuối; không failure mọi set nếu mới tập.",
        preferIsolation: true,
        volumeScale: 0.9,
      };
    case "science":
      return {
        sets: base.sets,
        reps: "6–12 (RIR 1–3)",
        restSec: 90,
        note: "Science-based: progressive overload · ghi log · RIR 1–3.",
        preferCompound: true,
        volumeScale: 1,
      };
    case "gorilla":
      return {
        sets: Math.min(5, base.sets + 1),
        reps: "6–10",
        restSec: 90,
        note: "Gorilla build: volume ngực–lưng–tay; chân giữ base.",
        preferCompound: true,
        volumeScale: 1.15,
      };
    case "full_body":
      return {
        sets: Math.max(2, base.sets - (seniorSoft ? 0 : 1)),
        reps: "6–10",
        restSec: 90,
        note: "Full body: ít isolation, mỗi buổi phủ lớn.",
        preferCompound: true,
        volumeScale: 0.85,
      };
    case "athletic":
      return {
        sets: base.sets,
        reps: "5–8 + conditioning",
        restSec: 90,
        note: "Athletic: chất lượng chuyển động + chút cardio/core.",
        preferCompound: true,
        volumeScale: 0.95,
      };
    case "bro_split":
      return {
        sets: Math.min(5, base.sets + 1),
        reps: "8–15",
        restSec: 60,
        note: "Bro split: volume cao / nhóm; recovery giữa các ngày.",
        preferIsolation: true,
        volumeScale: 1.2,
      };
    case "minimalist":
      return {
        sets: base.sets,
        reps: "5–8",
        restSec: 120,
        note: "Minimalist: 3–5 compound lớn, không nhồi isolation.",
        preferCompound: true,
        volumeScale: 0.7,
      };
    case "balanced":
    default:
      return {
        sets: base.sets,
        reps: band === "senior" ? "10–12" : "8–12",
        restSec: base.rest,
        note: "Cân bằng volume / phục hồi.",
        volumeScale: 1,
      };
  }
}

const COMPOUND_RE =
  /squat|deadlift|bench|press|row|pull-up|chin|lunge|hip thrust|clean|snatch|overhead|romanian|leg press|dip\b/i;
const ISOLATION_RE =
  /curl|extension|fly|raise|kickback|shrug|calf|crunch|lateral|front raise|pec deck|leg curl|leg extension/i;

export function rankForStyle(
  name: string,
  equipment: string,
  style: TrainingStyle,
): number {
  const rx = stylePrescription(style, "young", { sets: 3, rest: 60 });
  let score = 0;
  const compound = COMPOUND_RE.test(name) || equipment === "barbell";
  const isolation =
    ISOLATION_RE.test(name) ||
    equipment === "machine" ||
    equipment === "cable";
  if (rx.preferCompound && compound) score += 3;
  if (rx.preferCompound && isolation) score -= 1;
  if (rx.preferIsolation && isolation) score += 2;
  if (rx.preferIsolation && compound) score += 1;
  if (style === "gorilla" && /chest|back|row|pull|press|curl|tricep|lat/i.test(name))
    score += 2;
  if (style === "minimalist" && isolation) score -= 2;
  if (style === "athletic" && /jump|sprint|burpee|medicine|power|clean/i.test(name))
    score += 2;
  return score;
}
