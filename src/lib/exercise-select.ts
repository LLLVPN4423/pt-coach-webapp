/**
 * Chọn & xếp bài theo venue / thiết bị / y tế / mục tiêu / phong cách.
 */
import type { ExerciseTemplate } from "./exercises";
import { EXERCISES } from "./exercises";
import { rankForStyle } from "./training-styles";
import type {
  AgeBand,
  Goal,
  JointZone,
  LifeContext,
  Profile,
  TrainingStyle,
} from "./types";

export type EqKind =
  | "bodyweight"
  | "band"
  | "dumbbell"
  | "barbell"
  | "kettlebell"
  | "machine"
  | "any";

export const EQUIPMENT_TAG_OPTIONS: { id: EqKind; label: string }[] = [
  { id: "bodyweight", label: "Bodyweight" },
  { id: "band", label: "Band / dây kháng lực" },
  { id: "dumbbell", label: "Tạ đơn" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "barbell", label: "Barbell / rack" },
  { id: "machine", label: "Máy / cable" },
];

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "h_push"
  | "v_push"
  | "h_pull"
  | "v_pull"
  | "core"
  | "cardio"
  | "isolation"
  | "other";

export interface EquipmentProfile {
  venue: LifeContext["venue"];
  /** Hard allow-list — bài ngoài list bị loại (trừ nới nhẹ khi thiếu pool) */
  allowed: EqKind[];
  /** Soft boost */
  preferred: EqKind[];
  strict: boolean;
  summary: string;
}

export interface SelectContext {
  style: TrainingStyle;
  goal: Goal;
  band: AgeBand;
  jointSafe: boolean;
  lowImpact: boolean;
  avoidJoints: JointZone[];
  equipment: EquipmentProfile;
  physicalJob?: boolean;
  travelMode?: boolean;
}

const HOME_DEFAULT: EqKind[] = ["bodyweight", "band"];
const OUTDOOR_DEFAULT: EqKind[] = ["bodyweight", "band"];
const HOTEL_DEFAULT: EqKind[] = ["bodyweight", "band"];
const GYM_DEFAULT: EqKind[] = [
  "dumbbell",
  "barbell",
  "machine",
  "bodyweight",
  "band",
  "kettlebell",
  "any",
];

function normalizeEq(raw: string): EqKind | null {
  const s = raw.toLowerCase().trim();
  if (!s) return null;
  if (/body|không|ko tạ|no.?equip|calisthen/i.test(s) || s === "bodyweight")
    return "bodyweight";
  if (/band|dây|resistance/i.test(s)) return "band";
  if (/dumb|tạ đơn|db\b/i.test(s)) return "dumbbell";
  if (/kettle|kb\b/i.test(s)) return "kettlebell";
  if (/barb|tạ đòn|squat rack|Olympic/i.test(s)) return "barbell";
  if (/machine|máy|cable|smith/i.test(s)) return "machine";
  if (s === "any") return "any";
  return null;
}

/** Parse free-text + tags + venue → allow/prefer lists. */
export function resolveEquipmentProfile(profile: Profile): EquipmentProfile {
  const life = profile.life;
  const venue = life?.venue || "gym";
  const tags = (life?.equipmentTags || [])
    .map((t) => normalizeEq(t))
    .filter((t): t is EqKind => !!t);
  const fromText: EqKind[] = [];
  const text = (profile.availableEquipment || "").toLowerCase();
  for (const part of text.split(/[,;/|·\n]+/)) {
    const n = normalizeEq(part);
    if (n) fromText.push(n);
  }
  // Heuristics on full string
  if (/nhà|home|apartment/i.test(text) && !fromText.length) {
    fromText.push("bodyweight");
  }
  if (/gym|phòng tập/i.test(text)) {
    fromText.push("dumbbell", "barbell", "machine");
  }

  const merged = [...new Set<EqKind>([...tags, ...fromText])];

  if (venue === "home") {
    const allowed: EqKind[] = merged.length
      ? [...new Set<EqKind>([...merged, "bodyweight"])]
      : [...HOME_DEFAULT];
    // Home never assumes full gym machines unless tagged
    const filtered = allowed.filter(
      (e) => e !== "machine" || tags.includes("machine"),
    );
    return {
      venue,
      allowed: filtered.length ? filtered : HOME_DEFAULT,
      preferred: filtered.filter((e) => e !== "any"),
      strict: true,
      summary: `Nhà · ưu tiên ${filtered.join(", ")}`,
    };
  }

  if (venue === "hotel_travel") {
    const allowed: EqKind[] = merged.length
      ? [...new Set<EqKind>([...merged, "bodyweight", "band"])]
      : [...HOTEL_DEFAULT];
    return {
      venue,
      allowed: allowed.filter((e) => e !== "barbell" && e !== "machine"),
      preferred: ["bodyweight", "band", "dumbbell"],
      strict: true,
      summary: `Khách sạn/công tác · BW / band / DB nhẹ`,
    };
  }

  if (venue === "outdoor") {
    const allowed: EqKind[] = merged.length
      ? [...new Set<EqKind>([...merged, "bodyweight"])]
      : [...OUTDOOR_DEFAULT];
    return {
      venue,
      allowed: allowed.filter((e) => e !== "barbell" && e !== "machine"),
      preferred: ["bodyweight", "band"],
      strict: true,
      summary: `Ngoài trời · bodyweight / band`,
    };
  }

  // gym
  const preferred = merged.length
    ? merged
    : (["dumbbell", "barbell", "machine", "bodyweight"] as EqKind[]);
  return {
    venue: "gym",
    allowed: GYM_DEFAULT,
    preferred,
    strict: false,
    summary: `Gym · ưu tiên ${preferred.join(", ")}`,
  };
}

export function movementPattern(ex: ExerciseTemplate): MovementPattern {
  const n = ex.name.toLowerCase();
  if (ex.muscle === "cardio" || ex.category === "cardio") return "cardio";
  if (
    ex.muscle === "core" ||
    /plank|crunch|sit-up|dead bug|hollow|ab\b|russian twist/i.test(n)
  )
    return "core";
  if (/squat|leg press|hack squat|goblet/i.test(n)) return "squat";
  if (/deadlift|rdl|romanian|good morning|hip thrust|back extension/i.test(n))
    return "hinge";
  if (/lunge|split squat|step.?up|bulgarian/i.test(n)) return "lunge";
  if (/pull-?up|chin-?up|lat pull|pulldown/i.test(n)) return "v_pull";
  if (/row|face pull/i.test(n)) return "h_pull";
  if (/overhead|shoulder press|military|push press/i.test(n)) return "v_push";
  if (/bench|push-?up|chest press|fly|dip\b/i.test(n)) return "h_push";
  if (
    /curl|extension|raise|kickback|shrug|calf|isolation|pec deck|leg curl|leg extension/i.test(
      n,
    )
  )
    return "isolation";
  return "other";
}

function matchesMuscle(ex: ExerciseTemplate, muscle: string): boolean {
  if (muscle === "full") return ex.muscle !== "cardio";
  if (muscle === "cardio") {
    return (
      ex.category === "cardio" ||
      ex.muscle === "cardio" ||
      /walk|bike|cycle|run|march|cardio|jumping jack|burpee/i.test(ex.name)
    );
  }
  if (muscle === "core") {
    return (
      ex.muscle === "core" ||
      !!ex.primaryMuscles?.some((m) => /abdom/i.test(m)) ||
      /plank|crunch|sit-up|dead bug|hollow/i.test(ex.name)
    );
  }
  return ex.muscle === muscle;
}

function equipmentAllowed(ex: ExerciseTemplate, eq: EquipmentProfile): boolean {
  const kind = (ex.equipment || "any") as EqKind;
  if (kind === "any") return true;
  if (eq.allowed.includes(kind)) return true;
  // Catalog sometimes maps cable → machine
  if (kind === "machine" && eq.allowed.includes("machine")) return true;
  return false;
}

function levelFit(level: string, band: AgeBand): number {
  const l = (level || "").toLowerCase();
  if (band === "teen" || band === "senior") {
    if (l === "beginner") return 3;
    if (l === "intermediate") return 1;
    if (l === "expert" || l === "advanced") return -4;
  }
  if (band === "mid") {
    if (l === "expert" || l === "advanced") return -1;
    if (l === "beginner") return 1;
  }
  if (l === "intermediate") return 2;
  return 0;
}

export function scoreExercise(
  ex: ExerciseTemplate,
  ctx: SelectContext,
  opts?: {
    muscle?: string;
    usedPatterns?: Set<MovementPattern>;
    preferCompoundSlot?: boolean;
  },
): number {
  let score = 0;
  const eqKind = (ex.equipment || "any") as EqKind;
  const pattern = movementPattern(ex);

  // Equipment
  if (ctx.equipment.preferred.includes(eqKind)) score += 8;
  else if (eqKind === "bodyweight" && ctx.equipment.venue !== "gym") score += 6;
  else if (eqKind === "any") score += 1;
  else score -= 2;

  if (ctx.equipment.strict && !equipmentAllowed(ex, ctx.equipment)) {
    return -1000;
  }

  // Medical
  if (ctx.avoidJoints?.length) {
    if (ex.avoidJoints?.some((j) => ctx.avoidJoints.includes(j as JointZone))) {
      return -1000;
    }
  }
  if (ctx.jointSafe) {
    if (!ex.jointFriendly) score -= 6;
    else score += 3;
  }
  if (ctx.lowImpact || ctx.travelMode) {
    if (!ex.lowImpact) score -= 8;
    else score += 4;
  }

  // Style
  score += rankForStyle(ex.name, ex.equipment, ctx.style);

  // Compound vs isolation slot
  const compound =
    /squat|deadlift|bench|press|row|pull-up|chin|lunge|hip thrust|overhead|romanian|leg press|dip\b/i.test(
      ex.name,
    ) || eqKind === "barbell";
  if (opts?.preferCompoundSlot) {
    score += compound ? 10 : -3;
  } else {
    score += compound ? 2 : 1;
  }

  // Pattern diversity
  if (opts?.usedPatterns?.has(pattern) && pattern !== "isolation") {
    score -= 7;
  }
  if (pattern === "isolation" && opts?.preferCompoundSlot) score -= 4;

  // Goal
  if (ctx.goal === "fat_loss" && pattern === "cardio") score += 3;
  if (ctx.goal === "muscle_gain" && compound) score += 3;
  if (ctx.goal === "performance" && compound) score += 4;
  if (ctx.goal === "health" && ex.lowImpact) score += 2;

  // Physical job → de-emphasize heavy legs/posterior grinders
  if (ctx.physicalJob && (ex.muscle === "legs" || ex.muscle === "posterior")) {
    score -= 5;
  }

  score += levelFit(ex.level, ctx.band);

  // Prefer matching requested muscle bucket
  if (opts?.muscle && matchesMuscle(ex, opts.muscle)) score += 2;

  // Slight name quality: avoid odd "male/female" demo noise bias — no-op

  return score;
}

function poolForMuscle(
  muscle: string,
  ctx: SelectContext,
  relaxEquipment = false,
): ExerciseTemplate[] {
  let pool = EXERCISES.filter((e) => matchesMuscle(e, muscle));
  if (ctx.avoidJoints?.length) {
    pool = pool.filter(
      (e) =>
        !e.avoidJoints?.some((j) => ctx.avoidJoints.includes(j as JointZone)),
    );
  }
  if (!relaxEquipment && ctx.equipment.strict) {
    const hard = pool.filter((e) => equipmentAllowed(e, ctx.equipment));
    if (hard.length) pool = hard;
  } else if (!relaxEquipment) {
    const soft = pool.filter(
      (e) =>
        ctx.equipment.preferred.includes(e.equipment as EqKind) ||
        e.equipment === "any" ||
        e.equipment === "bodyweight",
    );
    if (soft.length >= 3) pool = soft;
  }
  if (ctx.lowImpact || ctx.travelMode) {
    const li = pool.filter((e) => e.lowImpact);
    if (li.length >= 2) pool = li;
  }
  if (ctx.jointSafe) {
    const jf = pool.filter((e) => e.jointFriendly);
    if (jf.length >= 2) pool = jf;
  }
  return pool;
}

/**
 * Chọn `count` bài cho một nhóm cơ, đã xếp điểm + đa dạng pattern.
 */
export function pickSmart(
  muscle: string,
  ctx: SelectContext,
  count: number,
  usedIds: Set<string>,
  usedPatterns: Set<MovementPattern>,
): ExerciseTemplate[] {
  const want = Math.max(0, count);
  if (!want) return [];

  let pool = poolForMuscle(muscle, ctx, false);
  if (pool.length < want) {
    pool = poolForMuscle(muscle, ctx, true);
  }
  if (!pool.length) return [];

  const out: ExerciseTemplate[] = [];
  const localPatterns = new Set(usedPatterns);

  for (let i = 0; i < want; i++) {
    const preferCompound = i === 0 && muscle !== "core" && muscle !== "cardio";
    const ranked = pool
      .filter((e) => !usedIds.has(e.id) && !out.some((o) => o.id === e.id))
      .map((e) => ({
        e,
        s: scoreExercise(e, ctx, {
          muscle,
          usedPatterns: localPatterns,
          preferCompoundSlot: preferCompound,
        }),
      }))
      .filter((x) => x.s > -500)
      .sort((a, b) => b.s - a.s);

    if (!ranked.length) break;
    const pick = ranked[0].e;
    out.push(pick);
    usedIds.add(pick.id);
    localPatterns.add(movementPattern(pick));
  }

  for (const p of localPatterns) usedPatterns.add(p);
  return out;
}

const MUSCLE_FILL: Record<string, string[]> = {
  legs: ["posterior", "core"],
  posterior: ["legs", "core"],
  chest: ["shoulders", "arms"],
  back: ["arms", "posterior"],
  shoulders: ["arms", "chest"],
  arms: ["shoulders", "back"],
  core: ["full"],
  full: ["chest", "back", "legs"],
  cardio: ["core"],
};

/**
 * Dựng một block buổi tập: compounds trước, isolation sau, đủ target bài.
 */
export function buildSessionPicks(
  muscleList: string[],
  target: number,
  ctx: SelectContext,
  globalUsed: Set<string>,
): ExerciseTemplate[] {
  const usedIds = new Set(globalUsed);
  const usedPatterns = new Set<MovementPattern>();
  const picks: ExerciseTemplate[] = [];

  const add = (muscle: string, want: number) => {
    const got = pickSmart(muscle, ctx, want, usedIds, usedPatterns);
    for (const g of got) {
      if (picks.length >= target) break;
      picks.push(g);
    }
  };

  // Pass 1: mỗi nhóm chính — compound-heavy
  for (const muscle of muscleList) {
    if (picks.length >= target) break;
    const want =
      muscle === "cardio" || muscle === "core"
        ? 1
        : Math.min(3, Math.max(2, Math.ceil(target / Math.max(1, muscleList.length))));
    add(muscle, want);
  }

  // Pass 2: fill từ nhóm phụ
  if (picks.length < target) {
    for (const muscle of muscleList) {
      for (const fill of MUSCLE_FILL[muscle] || ["core"]) {
        if (picks.length >= target) break;
        add(fill, 2);
      }
    }
  }

  // Pass 3: full-body fillers still on equipment
  if (picks.length < target) {
    add("full", target - picks.length);
  }

  for (const p of picks) globalUsed.add(p.id);
  return picks;
}

/** Gợi ý thay thế — cùng nhóm cơ + đúng thiết bị. */
export function smartAlternatives(
  ex: ExerciseTemplate,
  ctx: SelectContext,
  limit = 6,
): ExerciseTemplate[] {
  const used = new Set<string>([ex.id]);
  const patterns = new Set<MovementPattern>();
  return pickSmart(ex.muscle, ctx, limit, used, patterns).filter(
    (e) => e.id !== ex.id,
  );
}
